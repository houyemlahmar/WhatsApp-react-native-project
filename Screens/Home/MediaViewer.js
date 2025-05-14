import React, { useState,useRef,useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions, Alert, Linking } from "react-native";
import { Video } from "expo-av";

export default function MediaViewer({ route, navigation }) {
  const { messages, selectedKey } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (selectedKey) {
      const selected = messages.find((msg) => msg.key === selectedKey);
      if (selected) {
        if (selected.mediaType === "image") setSelectedImage(selected.media);
        else if (selected.mediaType === "video") setSelectedVideo(selected.media);
      }
    }
  }, [selectedKey, messages]);

  const openMedia = (item) => {
    if (item.mediaType === "image") {
      setSelectedImage(item.media);
    } else if (item.mediaType === "video") {
      setSelectedVideo(item.media);
    } else if (item.mediaType === "file") {
      Linking.openURL(item.media).catch(() => {
        Alert.alert("Cannot open file", "No app found to open this file.");
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.mediaItem} onPress={() => openMedia(item)}>
      {item.mediaType === "image" ? (
        <Image source={{ uri: item.media }} style={styles.image} />
      ) : item.mediaType === "video" ? (
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🎥</Text>
          <Text style={styles.fileName}>{item.media.split("/").pop()}</Text>
        </View>
      ) : item.mediaType === "file" ? (
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>📂</Text>
          <Text style={styles.fileName}>{item.media.split("/").pop()}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>No media found.</Text>}
      />

      {/* Image Modal */}
      <Modal visible={!!selectedImage} transparent onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal visible={!!selectedVideo} transparent onRequestClose={() => setSelectedVideo(null)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedVideo(null)}>
            <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
          <Video
            source={{ uri: selectedVideo }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay
            useNativeControls
            style={styles.fullVideo}
          />
        </View>
      </Modal>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 40,
  },
  mediaItem: {
    flex: 1,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181818",
    borderRadius: 10,
    minHeight: 150,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
    resizeMode: "cover",
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  iconText: {
    fontSize: 40,
    color: "#4CAF50",
  },
  fileName: {
    color: "#fff",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#222",
    padding: 8,
    borderRadius: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 40,
    right: 30,
    zIndex: 2,
    padding: 10,
  },
  fullImage: {
    width: width * 0.95,
    height: height * 0.7,
  },
  fullVideo: {
    width: width * 0.95,
    height: height * 0.7,
    backgroundColor: "#000",
  },
});