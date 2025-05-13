import { useEffect,useState } from "react";
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
import firebase from "../../Config";


const database= firebase.database();
const ref_database=database.ref(); 
const ref_listcomptes=ref_database.child("ListComptes");


export default function ListUsers(props) {
  const currentUserId = props.route.params.currentUserId;

  
  const [data, setdata] = useState([]);   // setdata taatiha en parametre tableau ekhyr w taaml rerender lil interface
  //rerender lezem setdata 
  
  
  //recuperer les données
      
  useEffect(() => {
  //First: code à exécuter lors du render
              ref_listcomptes.on("value", (snapshot) => {
                  var d = []; //yaabi d bel fonction
                  snapshot.forEach(un_compte => {
                      if (un_compte.val().id != currentUserId) {
                          d.push(un_compte.val());
                      }
                  });
                  console.log(d);
                  setdata(d); //affiche les donnees w yaawed yjib les données
              });
  
              return () => {   // code à la fin du render 
                  ref_listcomptes.off();
              }
          }, []
  //third: condition du rerender :
  //cas [] (tab vide )=> il va exec first une sseul fois 
  //cas [x]=> exec first lors de la modification de x 
  //cas " "(vide): mayaaml chy maandouch condition d'arret
      )
  
      //once : lancer marra bark k tlansi prgm mteek //ref_listComptes.once();

  
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
            <View
              key={item.id} // Pass the key directly here
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "black",
                padding: 10,
                margin: 5,
                borderRadius: 10,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("Chat", {
                    currentuserid: currentUserId, 
                    secondid: item.id, // the id of the selected user
                  });
                }}
              >
                <Image
                source={item.urlimage ? {uri:item.urlimage} :require("../../assets/profile.jpg")}
                            
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "#0052",
                    borderRadius: 40,
                    marginRight: 10,
                  }}
                />

        <Text>{item.pseudo}</Text>

        <Text
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
        <View 
        style={[
            styles.statusIndicator,
            { backgroundColor: item.connected ? "#4CAF50" : "#808080" },
          ]}
        />
        </TouchableOpacity>
      </View>
    );
  }}
  style={{
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  }}
/>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    color: "#11A",
    fontWeight: "bold",
  },
  flatList: {
    width: "95%",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fond légèrement transparent
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
  
  },
  imageContainer: {
    position: "relative", 
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 10,
    top: 4,
    right: 20,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  pseudo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00008B",
  },
  callContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  numero: {
    fontSize: 16,
    color: "#00008B",
    
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#E0E0E0",
    padding: 12,
    borderRadius: 50,
    marginRight: 10, // Espacement entre le bouton d'appel et de chat
  },
  chatButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
  },
});
