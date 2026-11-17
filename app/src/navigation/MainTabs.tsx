import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '@/lib/session';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { LearnScreen } from '@/screens/learn/LearnScreen';
import { PlansScreen } from '@/screens/plans/PlansScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useColors } from '@/theme';

import type {
  AdminStackParamList,
  HomeStackParamList,
  LearnStackParamList,
  MainTabParamList,
  PlansStackParamList,
  ProfileStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ----- One stack per tab -----
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Cadence' }} />
    </HomeStack.Navigator>
  );
}

const PlansStack = createNativeStackNavigator<PlansStackParamList>();
function PlansStackScreen() {
  return (
    <PlansStack.Navigator>
      <PlansStack.Screen name="Plans" component={PlansScreen} options={{ title: 'Plans' }} />
    </PlansStack.Navigator>
  );
}

const LearnStack = createNativeStackNavigator<LearnStackParamList>();
function LearnStackScreen() {
  return (
    <LearnStack.Navigator>
      <LearnStack.Screen name="Learn" component={LearnScreen} options={{ title: 'Learn' }} />
    </LearnStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminStackScreen() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
    </AdminStack.Navigator>
  );
}

// ----- Tabs -----
export function MainTabs() {
  const { isAdmin } = useSession();
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // each tab's stack draws its own header
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        // TODO: tab icons (e.g. react-native-vector-icons or lucide-react-native)
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
      }}>
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="PlansTab" component={PlansStackScreen} options={{ title: 'Plans' }} />
      <Tab.Screen name="LearnTab" component={LearnStackScreen} options={{ title: 'Learn' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
      {isAdmin && <Tab.Screen name="AdminTab" component={AdminStackScreen} options={{ title: 'Admin' }} />}
    </Tab.Navigator>
  );
}
