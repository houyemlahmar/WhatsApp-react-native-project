import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function MediaViewer({ route, navigation }) {
  const { uri, type } = route.params;

  return (
    <View style={styles.container}>
      {type === "image" && <Image source={{ uri }} style={styles.media} />}
      {type === "video" && (
        <TouchableOpacity onPress={() => console.log("Play video:", uri)}>
          <Text style={styles.mediaText}>🎥 Play Video</Text>
        </TouchableOpacity>
      )}
      {type === "file" && (
        <TouchableOpacity onPress={() => console.log("Open file:", uri)}>
          <Text style={styles.mediaText}>📂 Open File</Text>
        </TouchableOpacity>
      )}
      {type === "location" && (
        <Text style={styles.mediaText}>📍 Location: {uri}</Text>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  mediaText: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
});
