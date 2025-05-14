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
  Modal,
  Alert,
  Linking,
} from "react-native";
import firebase from "../Config";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";


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
  const [lastSeenMessage, setLastSeenMessage] = useState(null);

  const [secondUserPseudo, setSecondUserPseudo] = useState("");
  const [secondUserNumero, setSecondUserNumero] = useState("");
  const [secondUserImage, setSecondUserImage] = useState("");
  const [secondUserConnected, setSecondUserConnected] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  
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
          {istyping && (
            <Text style={{ fontSize: 13, color: "#4CAF50" }}>is typing ...</Text>
          )}        
        </View>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: secondUserConnected ? "#4CAF50" : "#C72C48",
            marginLeft: 10,
          }}
        />
      {/* Phone icon */}
        <TouchableOpacity
          style={{ marginLeft: 53 }}
          onPress={() => {
            // Open phone dialer
            Linking.openURL(`tel:${secondUserNumero}`);
          }}
        >
          <Icon name="phone" size={24} color="#555" />
        </TouchableOpacity>
        {/* Video call icon */}
        <TouchableOpacity
          style={{ marginLeft: 20 }}
          onPress={() => {
            // Navigate to your video call screen (replace with your logic)
            props.navigation.navigate("VideoCallScreen", { numero: secondUserNumero });
          }}
        >
          <Icon name="videocam" size={24} color="#555" />
        </TouchableOpacity>
        {/* 3-dots menu */}
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => setShowMenu(true)}>
          <Icon name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      ),
  });
}, [secondUserPseudo, secondUserNumero, secondUserImage, secondUserConnected]);

  // Delete all messages in the discussion
    const handleDeleteDiscussion = () => {
      Alert.alert(
        "Delete Discussion",
        "Are you sure you want to delete all messages in this discussion?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await ref_messages.remove();
              setShowMenu(false);
            },
          },
        ]
      );
    };

    // View all media sent in the discussion
  const handleViewMedia = () => {
    setShowMenu(false);
    // Navigate to a MediaViewer screen or show a modal with media
    props.navigation.navigate("MediaViewer", {
      messages: messages.filter(
        (msg) => msg.mediaType === "image" || msg.mediaType === "video" || msg.mediaType === "file"
      ),
    });
  };
  
  useEffect(() => {
    if (!currentUserId || !secondId) return;

    const handleMessageUpdate = (snapshot) => {
      const updatedMessages = [];
      let lastSeenMessageTemp = null;
      snapshot.forEach((un_msg) => {
        const msgData = un_msg.val();
        const msgKey = un_msg.key;

        // If the message is received by the current user and is not seen yet
        if (msgData.receiver === currentUserId && !msgData.seen) {
          lastSeenMessageTemp = null; // A new message is received, reset the last seen message
        }

        // If the message is sent by the current user and is seen
        if (msgData.sender === currentUserId && msgData.seen) {
          lastSeenMessageTemp = { ...msgData, key: msgKey };
        }

        // Handle reactions if present
        const reactions = msgData.reactions ? Object.values(msgData.reactions) : [];
        updatedMessages.push({ ...msgData, key: msgKey, reactions });
      });
      setMessages(updatedMessages);
      setLastSeenMessage(lastSeenMessageTemp);
    console.log("Loaded messages:", updatedMessages);

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
        modified: false, 
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

  const pickFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "*/*"
    ],
    copyToCacheDirectory: true,
  });

  if (result.type !== "cancel") {
    // You can also save the file name and mimeType if needed
    sendMedia(result.uri, "file", result.name, result.mimeType);
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
  if (item.mediaType === "image" || item.mediaType === "video" || item.mediaType === "file") {
    const mediaMessages = messages.filter(
      (msg) =>
        msg.mediaType === "image" ||
        msg.mediaType === "video" ||
        msg.mediaType === "file"
    );
    return (
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate("MediaViewer", {
            messages: mediaMessages,
            selectedKey: item.key, 
          })
        }
      >
        {item.mediaType === "image" ? (
          <Image source={{ uri: item.media }} style={styles.mediaImage} />
        ) : item.mediaType === "video" ? (
          <Text style={styles.mediaText}>🎥 Video</Text>
        ) : (
          <Text style={styles.mediaText}>
              📂 {item.fileName ? item.fileName : "File"}
            </Text>        
        )}
      </TouchableOpacity>
    );
  } else if (item.location) {
    const { latitude, longitude } = item.location;
    return (
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate("MediaViewer", {
            uri: `${latitude},${longitude}`,
            type: "location",
          })
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

      <TouchableOpacity onPress={() => handlePressMessage(item.key)}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.fromMe : styles.fromOther]}>
          <Text
            style={[
              styles.messageText,
              !isCurrentUser && styles.messageTextFromOther,]}>
                {item.body}
          </Text>
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
          {/* "Seen at" - Displayed only for the last seen message or the selected message */}
        {isCurrentUser && item.seen && item.seenTime && (
        (isSelected || (lastSeenMessage?.key === item.key && !messages.some((msg) => msg.receiver === currentUserId && !msg.seen))) && (
          <Text style={styles.seenText}>
            Seen at {formatDate(item.seenTime)}
          </Text>
        )
      )}
        </View>
      </TouchableOpacity>
      
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
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            justifyContent: "flex-start",
            alignItems: "flex-end",
          }}
          activeOpacity={1}
          onPressOut={() => setShowMenu(false)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              marginTop: 50,
              marginRight: 10,
              paddingVertical: 8,
              width: 200,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              style={{ padding: 15 }}
              onPress={handleDeleteDiscussion}
            >
              <Text style={{ color: "#C72C48", fontWeight: "bold" }}>Delete discussion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 15 }}
              onPress={handleViewMedia}
            >
              <Text style={{ color: "#4CAF50", fontWeight: "bold" }}>View media sent</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
              onFocus={() => {
                ref_unediscussion.child(currentUserId + "istyping").set(true);
              }}
              onBlur={() => {
                ref_unediscussion.child(currentUserId + "istyping").set(false);
              }}            
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Icon name={editingMessage ? "edit" : "send"} style={styles.sendButtonIcon} />
            </TouchableOpacity>
          </View>

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
    backgroundColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderColor: "#ddd",
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
    color: "#333",
  },
  headerNumero: {
    fontSize: 14,
    color: "#777",
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
    alignItems: "flex-end",
  },
  receivedMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, 
  },
  fromMe: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  fromOther: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextFromOther: {
    color: "#333",
  },
  messageTime: {
    fontSize: 13,
    color: "#999",
    marginTop: 5,
    alignSelf: "center",
  },
  seenText: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonIcon: {
    color: "#fff",
    fontSize: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 5,
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
  mediaImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  mediaText: {
    color: "#333",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginVertical: 5,
  },

}); 