import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import firebase from "../../Config";
import * as ImagePicker from 'expo-image-picker';
import {supabase} from "../../Config";

const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes = ref_database.child("ListComptes");

export default function Setting(props) {
  const currentUserId = props.route.params.currentUserId;
  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState();
  const [uriImage, seturiImage] = useState();  /// uriImage de profile fil local

  const ref_uncompte = ref_listcomptes.child(currentUserId);

    /// fetch personal data
    
    useEffect(() => {
      ref_uncompte.on("value", (snapshot) => {
        var d = snapshot.val();
        setPseudo(d.pseudo);
        setNumero(d.numero);
        seturiImage(d.urlimage);  /// urlImage de profile fil internet
      })
      return () => {
        ref_uncompte.off();
      };
    }, []);

  async function uploadImage(file) {
    const fileExt = file.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `imagegl1/${fileName}`;  // chemain sur telephone
 
    const response = await fetch(file);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();
 
  

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("imagegl1")
      .upload(filePath, arraybuffer, { upsert: true });
 
    if (uploadError) {
      console.error("Erreur pendant l’upload:", uploadError.message);
      return null;
    }
 
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("imagegl1")
      .getPublicUrl(filePath);
 
    if (publicUrlError) {
      console.error(
        "Erreur pour obtenir l’URL publique:",
        publicUrlError.message
      );
      return null;
    }
 
    const imageUrl = `${publicUrlData.publicUrl}`;  // chemain sur internet
    console.log("🆕 Nouvelle image URL:", imageUrl);
    return imageUrl;
  }
 
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      seturiImage(result.assets[0].uri);
    }
  };

  const validateInputs = () => {
  if (!pseudo.trim()) {
    alert("Le pseudo ne peut pas être vide !");
    return false;
  }

  if (!numero || numero.length !== 8 || isNaN(numero)) {
    alert("Le numéro doit contenir exactement 8 chiffres !");
    return false;
  }

  return true;
};

  return (
    <ImageBackground
      source={require("../../assets/beigeclaire.jpg")}
      style={styles.container}
    >
      <View style={styles.settingBox}>
        <Text style={styles.title}>Settings</Text>
        <TouchableHighlight onPress={()=> pickImage()}>
          <Image
            source={uriImage ? { uri:uriImage}:require("../../assets/profile.jpg")}
            style={styles.avatar}
          />
        </TouchableHighlight>
        <TextInput
          onChangeText={(ch) => setPseudo(ch)}
          style={styles.input}
          placeholder="User Name"
          placeholderTextColor="#666"
          value={pseudo}
        />
        <TextInput
          onChangeText={(ch) => setNumero(ch)}
          style={styles.input}
          placeholder="Number"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={numero}
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.customButton, { backgroundColor: "#16B84E" }]}
            onPress={async () => {
              if (!validateInputs()) return; // Vérifie les champs avant de continuer

              const linkImage = await uploadImage(uriImage);
              console.log("uri:" + linkImage);
              const ref_uncompte = ref_listcomptes.child(currentUserId);
              ref_uncompte.update({
                id: currentUserId,
                pseudo: pseudo,
                numero: numero,
                urlimage: linkImage,
              });
              alert("Saved successfully ✅");
            }}
          > 
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: "#C72C48" }]}
            onPress={() => {
              auth.signOut().then(() => {
                props.navigation.replace("Auth");
                ref_uncompte.update({
                  connected: false,
                });
              });
            }}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
    justifyContent: "center",
  },
  settingBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D51062", // rose vif
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(220, 220, 220, 0.6)",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    gap: 10,
  },
  customButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
