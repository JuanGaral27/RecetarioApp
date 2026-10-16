import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './AuthContext';
import { colors } from './theme';
import { Loading } from './ui';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RecipeListScreen from './screens/RecipeListScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import RecipeFormScreen from './screens/RecipeFormScreen';
import GroupsScreen from './screens/GroupsScreen';
import GroupFormScreen from './screens/GroupFormScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary, card: '#fff', text: colors.text, border: colors.border } };
const headerOptions = { headerTintColor: colors.primary, headerTitleStyle: { color: colors.text, fontWeight: '800' }, headerStyle: { backgroundColor: '#fff' } };

const icon = (emoji) => ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ ...headerOptions, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted }}>
      <Tab.Screen name="Mine" options={{ title: 'Mis recetas', tabBarIcon: icon('📒') }}>
        {(p) => <RecipeListScreen {...p} mode="mine" />}
      </Tab.Screen>
      <Tab.Screen name="Public" options={{ title: 'Generales', tabBarIcon: icon('🌎') }}>
        {(p) => <RecipeListScreen {...p} mode="public" />}
      </Tab.Screen>
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: 'Grupos', tabBarIcon: icon('📁') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, booting } = useAuth();
  if (booting) return <Loading />;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerOptions}>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Receta' }} />
            <Stack.Screen name="RecipeForm" component={RecipeFormScreen} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Grupo' }} />
            <Stack.Screen name="GroupForm" component={GroupFormScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
