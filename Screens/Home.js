import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ListUsers from './Home/ListUsers';
import Forums from './Home/Forums';
import Settings from './Home/Settings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentUserId = props.route.params.currentUserId;

  return (
    <Tab.Navigator
      initialRouteName="Users"
      shifting={true}
      activeColor="#D51062" 
      inactiveColor="#888" 
      barStyle={{ backgroundColor: 'rgba(230, 230, 151, 0.3)' }} 
    >
      <Tab.Screen
        name="Users"
        component={ListUsers}
        initialParams={{ currentUserId }}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ color }) => (
            <Icon name="account-group" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Forums"
        component={Forums}
        options={{
          tabBarLabel: 'Forums',
          tabBarIcon: ({ color }) => (
            <Icon name="forum" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        initialParams={{ currentUserId }}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Icon name="cog" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
