import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AdminBatch, AdminStudent } from '@/services/admin';
import type { Announcement, Instrument } from '@/types/api';

/** Top level: which group is shown depends on login state (see RootNavigator). */
export type RootStackParamList = {
  SignIn: undefined;
  VerifyPhone: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

/** Bottom tabs. Each tab has its own stack so detail screens can be pushed inside it. */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  PlansTab: NavigatorScreenParams<PlansStackParamList>;
  LearnTab: NavigatorScreenParams<LearnStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  AdminTab: NavigatorScreenParams<AdminStackParamList>;
};

// Add detail screens to these as they get built, e.g. PlanCheckout: { planId: string }.
export type HomeStackParamList = { Home: undefined };
export type PlansStackParamList = {
  Plans: undefined;
  PaymentSuccess: { instrument: Instrument; planName: string; endsAt: string | null; batchTitle: string | null };
};
export type LearnTab = 'updates' | 'practice';
export type LearnStackParamList = { Learn: { tab?: LearnTab } | undefined };
export type ProfileStackParamList = { Profile: undefined; EditProfile: undefined };
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminBatches: undefined;
  BatchForm: { batch?: AdminBatch } | undefined;
  AdminStudents: undefined;
  StudentDetail: { student: AdminStudent };
  ExistingStudents: undefined;
  ExistingStudentForm: undefined;
  ImportStudents: undefined;
  AdminPayments: undefined;
  AdminAnnouncements: undefined;
  AnnouncementForm: { announcement?: Announcement } | undefined;
  AdminResources: undefined;
  ResourceForm: undefined;
  AdminPlans: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type PlansScreenProps<T extends keyof PlansStackParamList> = NativeStackScreenProps<PlansStackParamList, T>;

export type LearnScreenProps<T extends keyof LearnStackParamList> = NativeStackScreenProps<LearnStackParamList, T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = NativeStackScreenProps<ProfileStackParamList, T>;

export type AdminScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<AdminStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootScreenProps<keyof RootStackParamList>
>;

// Lets useNavigation() be typed everywhere without generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
