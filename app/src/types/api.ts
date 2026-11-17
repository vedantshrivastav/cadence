/**
 * Shapes returned by the Cadence backend (../backend). Keep in sync with the backend models.
 * Dates arrive as ISO strings over JSON.
 */

export type Instrument = 'violin' | 'piano' | 'drums';
export type Role = 'student' | 'admin';
export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type ClassesPerWeek = 2 | 4;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  role: Role;
  instruments: Instrument[];
  avatarUrl: string | null;
}

export interface Plan {
  _id: string;
  name: string;
  classesPerWeek: ClassesPerWeek;
  pricePaise: number;
  durationDays: number;
  description?: string;
  features?: string[];
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  instrument: Instrument;
  plan: Pick<Plan, '_id' | 'name' | 'classesPerWeek'>;
  classesPerWeek: ClassesPerWeek;
  batch?: string;
  status: 'active' | 'cancelled';
  startDate: string;
  endDate: string;
  source: 'payment' | 'existing_student' | 'admin';
}

export interface ScheduleSlot {
  day: Weekday;
  startTime: string; // "HH:mm" IST
}

export interface Batch {
  _id: string;
  title: string;
  instrument: Instrument;
  classesPerWeek: ClassesPerWeek;
  level: 'beginner' | 'intermediate' | 'advanced';
  teacherName?: string;
  schedule: ScheduleSlot[];
  durationMinutes: number;
  isActive: boolean;
}

export interface MyClass extends Batch {
  meetLink: string;
  nextClassAt: string | null;
  isLiveNow: boolean;
  subscriptionEndsAt: string | null;
}

export interface Payment {
  _id: string;
  plan: Pick<Plan, '_id' | 'name' | 'classesPerWeek'>;
  instrument: Instrument;
  amountPaise: number;
  status: 'created' | 'paid' | 'failed';
  method?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  instruments: Instrument[];
  isPinned: boolean;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  instrument: Instrument;
  type: 'pdf' | 'video' | 'audio' | 'recording' | 'link';
  url: string;
  createdAt: string;
}

/** Options for react-native-razorpay's RazorpayCheckout.open(), returned by POST /payments/orders. */
export interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: 'INR';
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

export interface AuthResponse {
  success: true;
  token: string;
  user: User;
  needsPhoneVerification: boolean;
  linkedSubscriptions: number;
  subscriptions: Subscription[];
}
