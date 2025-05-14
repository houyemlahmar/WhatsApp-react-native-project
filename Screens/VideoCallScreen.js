import React from "react";
import { View, Text } from "react-native";

export default function VideoCallScreen({ route }) {
  const { numero } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Video Call</Text>
      <Text style={{ marginTop: 20 }}>Calling: {numero}</Text>
      {/* Implement your video call logic here */}
    </View>
  );
}