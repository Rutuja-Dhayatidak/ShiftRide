import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverLogin from './src/screens/DriverLogin';
import DriverDashboard from './src/screens/DriverDashboard';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DriverLogin"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="DriverLogin" component={DriverLogin} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
