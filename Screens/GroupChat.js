import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import firebase from "../Config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const database = firebase.database();
const ref_database = database.ref();
const ref_groups = ref_database.child("Groups");

export default function GroupChat({ route, navigation }) {
  const { groupId, userIds, currentUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState({});
  const [groupName, setGroupName] = useState("");
  const flatListRef = useRef(null);

  // Reference to this group's messages in Firebase
  const ref_group = ref_groups.child(groupId);
  const ref_messages = ref_group.child("Messages");

  // Fetch group info and members' info
  useEffect(() => {
    ref_group.once("value", (snap) => {
      setGroupName(snap.val()?.name || "Group");
    });
    const ref_listcomptes = database.ref("ListComptes");
    ref_listcomptes.once("value", (snapshot) => {
      const usersObj = {};
      snapshot.forEach((snap) => {
        const user = snap.val();
        usersObj[user.id] = user;
      });
      setUsers(usersObj);
    });
  }, []);

  // Listen for new messages
  useEffect(() => {
    ref_messages.on("value", (snapshot) => {
      const msgs = [];
      snapshot.forEach((child) => {
        msgs.push({ key: child.key, ...child.val() });
      });
      setMessages(msgs);
      setTimeout(() => {
        if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => ref_messages.off();
  }, []);

  // Send a message
  const sendMessage = () => {
    if (message.trim() === "" || !currentUserId) return;
    const key = ref_messages.push().key;
    ref_messages.child(key).set({
      body: message,
      sender: currentUserId,
      time: new Date().toISOString(),
    });
    setMessage("");
    Keyboard.dismiss();
  };

  // Format time
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

  // Render each message
  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.sender === currentUserId;
    const senderName = users[item.sender]?.pseudo || "Unknown";
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer,
        ]}
      >
        <View style={[styles.messageBubble, isCurrentUser ? styles.fromMe : styles.fromOther]}>
          <Text style={styles.senderName}>{senderName}</Text>
          <Text style={styles.messageText}>{item.body}</Text>
          <Text style={styles.messageTime}>{formatDate(item.time)}</Text>
        </View>
      </View>
    );
  };

  // Header with group name and icons
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerRow}>
          <Icon name="account-group" size={28} color="#D51062" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>{groupName}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerIcons}>
          <TouchableOpacity style={{ marginHorizontal: 8, marginLeft: 40 }}>
            <Icon name="phone" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 8 }}>
            <Icon name="video" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 8 }}>
            <Icon name="dots-vertical" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, groupName]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.messageList}
            renderItem={renderMessageItem}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D51062",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
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
    backgroundColor: "#f0f0f0",
  },
  fromMe: {
    backgroundColor: "#4CAF50",
  },
  fromOther: {
    backgroundColor: "#f0f0f0",
  },
  senderName: {
    fontWeight: "bold",
    color: "#D51062",
    marginBottom: 2,
  },
  messageText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
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
});