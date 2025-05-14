import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  BackHandler,
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";

const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes = ref_database.child("ListComptes");

export default function NewAccount(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  return (
    <ImageBackground
      source={require("../assets/img3.png")}
      style={styles.container}
    >
      <View style={styles.authBox}>
        <Text style={styles.title}>Create New Account</Text>

        <TextInput
          onChangeText={(ch) => setEmail(ch)}
          style={styles.input}
          placeholder="email@site.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
        />
        <TextInput
          onChangeText={(ch) => setPassword(ch)}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"
          secureTextEntry
        />
        <TextInput
          onChangeText={(ch) => setConfirmPassword(ch)}
          style={styles.input}
          placeholder="confirm Password"
          placeholderTextColor="#555"
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
              if (password === confirmPassword) {
                auth
                  .createUserWithEmailAndPassword(email, password)
                  .then(() => {
                    const currentUserId = auth.currentUser.uid;
                    props.navigation.replace("Settings", { currentUserId });
                    const ref_uncompte = ref_listcomptes.child(currentUserId);
                    ref_uncompte.set({
                      id: currentUserId,
                      connected: true,
                      });

                  })
                  .catch((err) => alert(err.message));
              } else {
                alert("Password does not match");
              }
            }}
            title="Create"
            color="#16B84E" 
          />
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            title="Back"
            color="#C72C48"  
          />
        </View>

        <StatusBar style="auto" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#BEF574",
    alignItems: "center",
    justifyContent: "center",
  },
  authBox: {
    width:"90%",
    height : 320,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "rgba(232, 245, 217, 0.7)", // Ajout de la transparence
    borderRadius:20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#386F48",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    backgroundColor: "#FFF0BC",
    marginBottom: 15,
    textAlign: "center",
    borderRadius:40,
    color: "#000",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
});
