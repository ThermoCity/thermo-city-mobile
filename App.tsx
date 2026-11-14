import LoginScreen from './src/screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AgentHomeScreen from './src/screens/AgentHomeScreen';
import CitizenHomeScreen from './src/screens/CitizenHomeScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AgentHomeScreen"
            component={AgentHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CitizenHomeScreen"
            component={CitizenHomeScreen}
            options={{ headerShown: false }}
          />
          </Stack.Navigator>
    </NavigationContainer>
  )
}
