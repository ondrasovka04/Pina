import LoginScreen from './Screens/LoginScreen';
import MenuScreen from './Screens/Menu';
import ZapisScreen from './Screens/ZapisScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import registerNNPushToken from 'native-notify';

export default function App() {
  const Stack = createNativeStackNavigator();
  registerNNPushToken(6410, '8GZqBfY2dlph013xl9BGiQ');

  const MyStack = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={LoginScreen}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="Menu"
            component={MenuScreen}
          />

          <Stack.Screen
            name="Prohřešky"
            component={ZapisScreen}
          />

        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  return (
    <MyStack />
  );

}
