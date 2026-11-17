import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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
export type PlansStackParamList = { Plans: undefined };
export type LearnStackParamList = { Learn: undefined };
export type ProfileStackParamList = { Profile: undefined };
export type AdminStackParamList = { AdminDashboard: undefined };

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

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
