import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import firebase from "../Config";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";


const database = firebase.database();
const ref_database = database.ref();
const ref_lesdiscussions = ref_database.child("Listes_discussionsGL1");

export default function Chats(props) {
  const currentUserId = props.route.params.currentuserid;
  const secondId = props.route?.params?.secondid;

  const id_desc = currentUserId > secondId ? currentUserId + secondId : secondId + currentUserId;
  const ref_unediscussion = ref_lesdiscussions.child(id_desc);
  const ref_messages = ref_unediscussion.child("Messages");
  const ref_istyping = ref_unediscussion.child(secondId + "istyping");
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [istyping, setIstyping] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  
  const [secondUserPseudo, setSecondUserPseudo] = useState("");
  const [secondUserNumero, setSecondUserNumero] = useState("");
  const [secondUserImage, setSecondUserImage] = useState("");
  const [secondUserConnected, setSecondUserConnected] = useState(false);

  
useEffect(() => {
  const ref_secondUser = database.ref(`ListComptes/${secondId}`);
  ref_secondUser.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setSecondUserPseudo(data.pseudo);
      setSecondUserNumero(data.numero);
      setSecondUserImage(data.urlimage || data.uriImage);
      setSecondUserConnected(data.connected); 
    }
  });

  return () => {
    ref_secondUser.off();
  };
}, [secondId]);

  useEffect(() => {
    ref_istyping.on("value", (snapshot) => {
      setIstyping(snapshot.val());
    });

    return () => {
      ref_istyping.off();
    };
  }, []);

  useEffect(() => {
  props.navigation.setOptions({
    headerTitle: () => (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={secondUserImage ? { uri: secondUserImage } : require("../assets/profile.jpg")}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 0, right: 15}}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{secondUserPseudo}</Text>
          <Text style={{ fontSize: 14, color: "#555" }}>{secondUserNumero}</Text>
        </View>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: secondUserConnected ? "#4CAF50" : "red",
            marginLeft: 10,
          }}
        />
      </View>
    ),
  });
}, [secondUserPseudo, secondUserNumero, secondUserImage, secondUserConnected]);

  useEffect(() => {
    if (!currentUserId || !secondId) return;

    const handleMessageUpdate = (snapshot) => {
      const updatedMessages = [];
      snapshot.forEach((un_msg) => {
        const msgData = un_msg.val();
        const msgKey = un_msg.key;

        // Si le message est destiné à l'utilisateur actuel et non encore vu
        if (msgData.receiver === currentUserId && !msgData.seen) {
          const ref_msg = ref_messages.child(msgKey);
          ref_msg.update({
            seen: true,
            seenTime: Date.now(),
          });
        }

        // Handle reactions if present
        const reactions = msgData.reactions ? Object.values(msgData.reactions) : [];
        updatedMessages.push({ ...msgData, key: msgKey, reactions });
      });

      setMessages(updatedMessages);

      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    };

    ref_messages.on("value", handleMessageUpdate);

    return () => {
      ref_messages.off("value", handleMessageUpdate);
    };
  }, [currentUserId, secondId]);


  const addReaction = (key, emoji) => {
    const ref_msg = ref_messages.child(key).child("reactions");
    ref_msg.once("value", (snapshot) => {
      const reactions = snapshot.val() || {};
      const userReactionKey = Object.keys(reactions).find(
        (key) => reactions[key].user === currentUserId
      );

      if (userReactionKey) {
        // Update the existing reaction
        ref_msg.child(userReactionKey).update({ emoji });
      } else {
        // Add a new reaction
        const newKey = ref_msg.push().key;
        ref_msg.child(newKey).set({ emoji, user: currentUserId });
      }
    });
  };





  const sendMessage = () => {
    if (message.trim() === "") return;

    if (editingMessage) {
      const ref_msg = ref_messages.child(editingMessage.key);
      ref_msg.update({
        body: message,
        modified: true,
      }, (error) => {
        if (error) {
          console.error("Error updating message:", error);
        } else {
          console.log("Message updated:", editingMessage.key);
        }
      });
      setEditingMessage(null);
    } else {
      const key = ref_unediscussion.push().key;
      const ref_unmsg = ref_messages.child(key);

      ref_unmsg.set({
        body: message,
        time: new Date().toISOString(),
        sender: currentUserId,
        receiver: secondId,
        seen: false,
        seenTime: null,
        modified: false, // New messages are not modified by default
      });
    }

    setMessage("");
    Keyboard.dismiss();
  };

  const handlePressMessage = (key) => {
    setSelectedMessageId((prev) => (prev === key ? null : key));
  };

  const handleEditMessage = (key, body) => {
    setEditingMessage({ key, body });
    setMessage(body);
  };


  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const isToday = now.toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const deleteMessage = (key) => {
    const ref_msg = ref_messages.child(key);
    ref_msg.remove((error) => {
      if (error) {
        console.error("Error deleting message:", error);
      } else {
        console.log("Message deleted:", key);
      }
    });
  };

    // Pick an image from the device
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      sendMedia(uri, "image");
    }
  };

  // Pick a video from the device
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      sendMedia(uri, "video");
    }
  };

  // Pick a file from the device
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.type !== "cancel") {
      sendMedia(result.uri, "file");
    }
  };

  // Send location
  const sendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location is required!");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    const key = ref_unediscussion.push().key;
    const ref_unmsg = ref_messages.child(key);
    ref_unmsg.set({
      location: locationData,
      time: new Date().toISOString(),
      sender: currentUserId,
      receiver: secondId,
      seen: false,
      seenTime: null,
      modified: false,
    });
  };
  // Send media (image, video, or file)
  const sendMedia = async (uri, type) => {
    const key = ref_unediscussion.push().key;
    const ref_unmsg = ref_messages.child(key);

    // Save media data
    ref_unmsg.set({
      media: uri,
      mediaType: type,
      time: new Date().toISOString(),
      sender: currentUserId,
      receiver: secondId,
      seen: false,
      seenTime: null,
      modified: false,
    });

    console.log(`Media sent: ${type} - ${uri}`);
  };

  
const renderMessageItem = ({ item }) => {
  const isCurrentUser = item.sender === currentUserId;
  const isSelected = selectedMessageId === item.key;
  const userReaction = item.reactions.find((reaction) => reaction.user === currentUserId);

  const renderMedia = () => {
    if (item.mediaType === "image") {
      return (
        <TouchableOpacity
          onPress={() => props.navigation.navigate("MediaViewer", { uri: item.media, type: "image" })}
        >
          <Image source={{ uri: item.media }} style={styles.mediaImage} />
        </TouchableOpacity>
      );
    } else if (item.mediaType === "video") {
      return (
        <TouchableOpacity
          onPress={() => props.navigation.navigate("MediaViewer", { uri: item.media, type: "video" })}
        >
          <Text style={styles.mediaText}>🎥 Video</Text>
        </TouchableOpacity>
      );
    } else if (item.mediaType === "file") {
      return (
        <TouchableOpacity
          onPress={() => props.navigation.navigate("MediaViewer", { uri: item.media, type: "file" })}
        >
          <Text style={styles.mediaText}>📂 File</Text>
        </TouchableOpacity>
      );
    } else if (item.location) {
      const { latitude, longitude } = item.location;
      return (
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate("MediaViewer", { uri: `${latitude},${longitude}`, type: "location" })
          }
        >
          <Text style={styles.mediaText}>📍 Location</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };


  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer,
      ]}
    >
      <TouchableOpacity onPress={() => handlePressMessage(item.key)}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.fromMe : styles.fromOther]}>
          {item.body ? <Text style={styles.messageText}>{item.body}</Text> : null}
          {renderMedia()}
          {userReaction && (
            <View
              style={[
                styles.reactionBubble,
                isCurrentUser ? styles.reactionFromMe : styles.reactionFromOther,
              ]}
            >
              <Text style={styles.reactionEmoji}>{userReaction.emoji}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isSelected && (
        <Text style={styles.messageTime}>{formatDate(item.time)}</Text>
      )}

      {isSelected && isCurrentUser && (
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => handleEditMessage(item.key, item.body)}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteMessage(item.key)}>
            <Text style={styles.icon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isCurrentUser && isSelected && (
        <View style={styles.emojiContainer}>
          {["❤️", "👍", "😂", "😡", "😢"].map((emoji) => (
            <TouchableOpacity key={emoji} onPress={() => addReaction(item.key, emoji)}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.modified && (
        <Text style={styles.modifiedText}>Edited</Text>
      )}
    </View>
  );
};


return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "android" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ImageBackground source={require("../assets/bgChat5.jpg")} style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.messageList}
            renderItem={renderMessageItem}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.icon}>🖼️</Text>
            </TouchableOpacity>
  
            <TouchableOpacity onPress={pickVideo}>
              <Text style={styles.icon}>🎥</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickFile}>
              <Text style={styles.icon}>📂</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={sendLocation}>
              <Text style={styles.icon}>📍</Text>
            </TouchableOpacity>

            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              placeholder="Type your message..."
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>
                {editingMessage ? "Update" : "Send"}
              </Text>
            </TouchableOpacity>
          </View>

          {istyping && <Text style={styles.typingIndicator}>is typing ...</Text>}
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerPseudo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerNumero: {
    fontSize: 14,
    color: "#555",
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    marginBottom: 10, 
  },
  sentMessageContainer: {
    justifyContent: "flex-end",
  },
  receivedMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    maxWidth: "70%",
  },
  fromMe: {
    backgroundColor: "#386F48",
    alignSelf: "flex-end",
  },
  fromOther: {
    backgroundColor: "#000",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  messageTime: {
    color: "#386F48",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  seenContainer: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
  },
  seenText: {
    fontSize: 10,
    color: "#386F48",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#386F48",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 5,
  },
  emoji: {
    fontSize: 20,
    marginHorizontal: 5,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  icon: {
    fontSize: 20,
    marginHorizontal: 5,
  },
  reactionBubble: {
    position: "absolute",
    backgroundColor: "transparent",
    bottom: -10,
    borderRadius: 10,
    elevation: 2,
  },
  reactionFromMe: {
    left: -10,
  },
  reactionFromOther: {
    right: -10,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  modifiedText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    alignSelf: "flex-end",
  },
  mediaImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  mediaText: {
    color: "#386F48",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginVertical: 5,
  },

});