import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "../../Config";

const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes = ref_database.child("ListComptes");
const ref_groups = ref_database.child("Groups");

export default function Forums({ navigation, route }) {
  const currentUserId = route?.params?.currentUserId;
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  // Fetch users (excluding current user)
  useEffect(() => {
    ref_listcomptes.on("value", (snapshot) => {
      const usersArray = [];
      snapshot.forEach((un_compte) => {
        const user = un_compte.val();
        if (user.id !== currentUserId) {
          usersArray.push(user);
        }
      });
      setUsers(usersArray);
      setLoading(false);
    });
    return () => ref_listcomptes.off();
  }, [currentUserId]);

  // Fetch groups
  useEffect(() => {
    ref_groups.on("value", (snapshot) => {
      const groupsArray = [];
      snapshot.forEach((groupSnap) => {
        groupsArray.push({ id: groupSnap.key, ...groupSnap.val() });
      });
      setGroups(groupsArray);
    });
    return () => ref_groups.off();
  }, []);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = () => {
    if (!currentUserId) {
      Alert.alert("Error", "Current user is not defined.");
      return;
    }
    if (selectedUsers.length < 2) {
      Alert.alert("Group must have at least 3 users (including you).");
      return;
    }
    if (!groupName.trim()) {
      Alert.alert("Please enter a group name.");
      return;
    }
    const groupId = "group_" + Date.now();
    ref_groups.child(groupId).set({
      name: groupName,
      members: [currentUserId, ...selectedUsers],
      createdAt: new Date().toISOString(),
    });
    setShowModal(false);
    setSelectedUsers([]);
    setGroupName("");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity
          style={styles.addGroupIconButton}
          onPress={() => setShowModal(true)}
        >
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() =>
              navigation.navigate("GroupChat", {
                groupId: item.id,
                userIds: item.members,
                currentUserId: currentUserId,
              })
            }
          >
            <Text style={styles.groupName}>
              {item.name ? item.name : `Group: ${item.id}`}
            </Text>
            <Text style={styles.groupMembers}>Members: {item.members?.length}</Text>
          </TouchableOpacity>
        )}
        style={styles.flatList}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            No groups yet.
          </Text>
        }
      />

      {/* Modal for adding group */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Create Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
            />
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.card,
                    selectedUsers.includes(item.id) && styles.selectedUser,
                  ]}
                  onPress={() => toggleUser(item.id)}
                >
                  <Image
                    source={
                      item.urlimage
                        ? { uri: item.urlimage }
                        : require("../../assets/profile.jpg")
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.pseudo}>{item.pseudo}</Text>
                    <Text style={styles.numero}>{item.numero}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: item.connected
                          ? "#4CAF50"
                          : "#C72C48",
                      },
                    ]}
                  />
                  {selectedUsers.includes(item.id) && (
                    <View style={styles.checkCircle}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        ✓
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              style={styles.flatList}
            />
            <Button
              title="Create Group"
              onPress={createGroup}
              color="#4CAF50"
              disabled={selectedUsers.length < 2 || !groupName.trim()}
            />
            <Button
              title="Cancel"
              color="#C72C48"
              onPress={() => {
                setShowModal(false);
                setSelectedUsers([]);
                setGroupName("");
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  addGroupIconButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    color: "#D51062",
    fontWeight: "bold",
    marginVertical: 20,
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  flatList: {
    width: "95%",
  },
  groupCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    elevation: 2,
  },
  groupName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  groupMembers: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  selectedUser: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  pseudo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  numero: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 4,
  },
  statusIndicator: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
    top: 15,
    left: 62,
  },
  checkCircle: {
    position: "absolute",
    right: 15,
    top: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
});