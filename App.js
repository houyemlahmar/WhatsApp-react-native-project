import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Auth from "./Screens/Auth";
import NewAccount from "./Screens/NewAccount";
import Home from "./Screens/Home";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Settings from "./Screens/Home/Settings";
import Chats from "./Screens/Chats";
import MediaViewer from "./Screens/Home/MediaViewer";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false,}} ></Stack.Screen>
        <Stack.Screen name="NewAccount" component={NewAccount} options={{ 
            headerShown: true, 
            headerTitle: "New Account",
            headerStyle: { backgroundColor: '#E6E697' }, 
          }} ></Stack.Screen>
        <Stack.Screen name="Chat" component={Chats} options={{headerStyle: { backgroundColor: '#E6E697' }, }}></Stack.Screen>
        <Stack.Screen name="MediaViewer" component={MediaViewer} options={{headerTitle: "Media", headerStyle: { backgroundColor: '#000' }, }}></Stack.Screen>

        <Stack.Screen name="Home" component={Home} options={{headerStyle: { backgroundColor: '#E6E697' }, }}></Stack.Screen>
        <Stack.Screen name="Settings" component={Settings} options={{headerStyle: { backgroundColor: '#E6E697' }, }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}