import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Platform } from 'react-native';
import CitizenHomeScreen from '../screens/CitizenHomeScreen';
import CitizenGuideScreen from '../screens/CitizenGuideScreen';
// import ProfileScreen from '../screens/ProfileScreen'; // Substitua pelo seu componente de perfil, se houver
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLORS.laranjaSol,
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.45)' : '#7E9F8E',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'sunny' : 'sunny-outline';
          } else if (route.name === 'Guide') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CitizenHomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Guide"
        component={CitizenGuideScreen}
        options={{ tabBarLabel: 'Guia do Calor' }}
      />
      {/* <Tab.Screen
        name="Profile"
        // component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      /> */}
    </Tab.Navigator>
  );
}
