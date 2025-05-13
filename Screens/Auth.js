import { StatusBar } from "expo-status-bar";
import { BackHandler, Button, ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import firebase from "../Config";

const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes = ref_database.child("ListComptes");

export default function Auth(props) {
  const [email, setEmail] = useState("houyeym@gmail.com");
  const [password, setPassword] = useState("123456");

  return (
    <ImageBackground source={require("../assets/img3.png")} style={styles.container}>
      <View style={styles.authBox}>
        <Text style={styles.title}>Bienvenue</Text>
        <TextInput 
          onChangeText={(ch) => setEmail(ch)} 
          style={styles.input} 
          placeholder="email@site.com" 
          placeholderTextColor="#555" 
        />
        <TextInput 
          onChangeText={(ch) => setPassword(ch)} 
          style={styles.input} 
          placeholder="****" 
          placeholderTextColor="#555" 
          secureTextEntry 
        />
        
        <View style={styles.buttonContainer}>
          <Button 
            onPress={() => {
              auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                  const currentUserId=auth.currentUser.uid;
                  props.navigation.navigate("Home",{currentUserId});
                  // Mettre à jour le statut de connexion dans la base de données
                  const ref_uncompte = ref_listcomptes.child(currentUserId);
                    ref_uncompte.update({
                      connected: true,
                      });
                  
                })
                .catch((err) => alert(err));
            }} 
            title="Connect" 
            color="#16B84E">
          </Button>

          <Button onPress={() => BackHandler.exitApp()} title="Exit" color="#C72C48"></Button>
        </View>
        
        <Text onPress={() => props.navigation.navigate("NewAccount")} style={styles.linkText}>
          Don't have an account? Click here to create one !
        </Text>
        
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
    fontSize: 34,
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
    borderRadius: 40,
    color: "#000", // Texte en noir pour meilleure lisibilité
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  linkText: {
    width: "100%",
    fontStyle: "italic",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: "15",
    color: "#00561B",
    marginRight: 20,
  },
});

