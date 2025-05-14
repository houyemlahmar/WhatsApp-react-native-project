import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Video } from "expo-av";

export default function VideoCallScreen({ route, navigation }) {
  const { numero } = route.params;
  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Call</Text>
      <Text style={styles.subtitle}>Calling: {numero}</Text>
      <Video
        ref={videoRef}
        source={{
          uri: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video, replace with your stream
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        useNativeControls
        style={styles.video}
      />
      <TouchableOpacity style={styles.endButton} onPress={() => navigation.goBack()}>
        <Text style={styles.endButtonText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  subtitle: { color: "#fff", marginBottom: 20 },
  video: { width: "90%", height: 300, backgroundColor: "#222", borderRadius: 10 },
  endButton: {
    marginTop: 30,
    backgroundColor: "#C72C48",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  endButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});