import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // For modern icons
import firebase from "../../Config";

const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes = ref_database.child("ListComptes");

export default function ListUsers(props) {
  const currentUserId = props.route.params.currentUserId;

  const [data, setdata] = useState([]);

  useEffect(() => {
    ref_listcomptes.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((un_compte) => {
        if (un_compte.val().id !== currentUserId) {
          d.push(un_compte.val());
        }
      });
      console.log(d);
      setdata(d);
    });

    return () => {
      ref_listcomptes.off();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/beigeclaire.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>List Users</Text>

      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Image
                source={item.urlimage ? { uri: item.urlimage } : require("../../assets/profile.jpg")}
                style={styles.profileImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.pseudo}>{item.pseudo}</Text>
                <View style={styles.callContainer}>
                  <MaterialIcons name="phone" size={18} color="#4CAF50" />
                  <Text
                    style={styles.numero}
                    onPress={() => {
                      if (Platform.OS === "android") {
                        Linking.openURL("tel:" + item.numero);
                      } else {
                        Linking.openURL("telprompt:" + item.numero);
                      }
                    }}
                  >
                    {item.numero}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: item.connected ? "#4CAF50" : "#C72C48" },
                ]}
              />
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  props.navigation.navigate("Chat", {
                    currentuserid: currentUserId,
                    secondid: item.id,
                  });
                }}
              >
                <MaterialIcons name="chat" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
        style={styles.flatList}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 32,
    color: "#D51062",
    fontWeight: "bold",
    marginVertical: 20,
  },
  flatList: {
    width: "95%",
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
    elevation: 5, // For Android shadow
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
  callContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  numero: {
    fontSize: 16,
    color: "#4CAF50",
    marginLeft: 5,
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
  chatButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});