import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '@/lib/session';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminBatchesScreen } from '@/screens/admin/AdminBatchesScreen';
import { BatchFormScreen } from '@/screens/admin/BatchFormScreen';
import { AdminStudentsScreen } from '@/screens/admin/AdminStudentsScreen';
import { StudentDetailScreen } from '@/screens/admin/StudentDetailScreen';
import { ExistingStudentsScreen } from '@/screens/admin/ExistingStudentsScreen';
import { ExistingStudentFormScreen } from '@/screens/admin/ExistingStudentFormScreen';
import { ImportStudentsScreen } from '@/screens/admin/ImportStudentsScreen';
import { AdminPaymentsScreen } from '@/screens/admin/AdminPaymentsScreen';
import { AdminAnnouncementsScreen } from '@/screens/admin/AdminAnnouncementsScreen';
import { AnnouncementFormScreen } from '@/screens/admin/AnnouncementFormScreen';
import { AdminResourcesScreen } from '@/screens/admin/AdminResourcesScreen';
import { ResourceFormScreen } from '@/screens/admin/ResourceFormScreen';
import { AdminPlansScreen } from '@/screens/admin/AdminPlansScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { LearnScreen } from '@/screens/learn/LearnScreen';
import { PaymentSuccessScreen } from '@/screens/plans/PaymentSuccessScreen';
import { PlansScreen } from '@/screens/plans/PlansScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
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
      <PlansStack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        // No back button / swipe back to the checkout once paid.
        options={{ headerShown: false, gestureEnabled: false, headerBackVisible: false }}
      />
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
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
    </ProfileStack.Navigator>
  );
}

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminStackScreen() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      <AdminStack.Screen name="AdminBatches" component={AdminBatchesScreen} options={{ title: 'Batches' }} />
      <AdminStack.Screen name="BatchForm" component={BatchFormScreen} options={({ route }) => ({ title: route.params?.batch ? 'Edit batch' : 'New batch' })} />
      <AdminStack.Screen name="AdminStudents" component={AdminStudentsScreen} options={{ title: 'Students' }} />
      <AdminStack.Screen name="StudentDetail" component={StudentDetailScreen} options={{ title: 'Student' }} />
      <AdminStack.Screen name="ExistingStudents" component={ExistingStudentsScreen} options={{ title: 'Already-paid students' }} />
      <AdminStack.Screen name="ExistingStudentForm" component={ExistingStudentFormScreen} options={{ title: 'Add student' }} />
      <AdminStack.Screen name="ImportStudents" component={ImportStudentsScreen} options={{ title: 'Import list' }} />
      <AdminStack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ title: 'Payments' }} />
      <AdminStack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} options={{ title: 'Announcements' }} />
      <AdminStack.Screen name="AnnouncementForm" component={AnnouncementFormScreen} options={({ route }) => ({ title: route.params?.announcement ? 'Edit announcement' : 'New announcement' })} />
      <AdminStack.Screen name="AdminResources" component={AdminResourcesScreen} options={{ title: 'Practice material' }} />
      <AdminStack.Screen name="ResourceForm" component={ResourceFormScreen} options={{ title: 'Add material' }} />
      <AdminStack.Screen name="AdminPlans" component={AdminPlansScreen} options={{ title: 'Plans & prices' }} />
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
