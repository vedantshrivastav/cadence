import { api } from '@/lib/api';
import type {
  Announcement,
  Batch,
  ClassesPerWeek,
  Instrument,
  Payment,
  Plan,
  Resource,
  ScheduleSlot,
  Subscription,
  User,
} from '@/types/api';

export interface AdminStats {
  totalStudents: number;
  activeSubscriptions: number;
  expiringIn7Days: number;
  revenueThisMonthPaise: number;
  paymentsThisMonth: number;
  existingStudentsNotYetSignedUp: number;
}

export type AdminBatch = Batch & { meetLink: string };

export interface BatchInput {
  title: string;
  instrument: Instrument;
  classesPerWeek: ClassesPerWeek;
  level?: Batch['level'];
  teacherName?: string;
  schedule: ScheduleSlot[];
  durationMinutes?: number;
  meetLink: string;
  isActive?: boolean;
}

/** Student as returned by GET /admin/students (raw DB user + all subscriptions). */
export interface AdminStudent extends Omit<User, 'id'> {
  _id: string;
  isActive: boolean;
  createdAt: string;
  subscriptions: (Omit<Subscription, 'batch'> & {
    batch?: { _id: string; title: string } | null;
    isActive: boolean;
    notes?: string;
  })[];
}

export interface ExistingStudentInput {
  name: string;
  phone: string;
  email?: string;
  instrument: Instrument;
  classesPerWeek: ClassesPerWeek;
  batchId?: string;
  paidUntil: string; // "YYYY-MM-DD"
}

export interface ExistingStudentRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  instrument: Instrument;
  classesPerWeek: ClassesPerWeek;
  batch?: string;
  paidUntil: string;
  claimedBy?: { _id: string; name: string; email: string } | null;
  claimedAt?: string;
}

export type AdminPayment = Omit<Payment, 'plan'> & {
  plan?: { _id: string; name: string } | null;
  user?: { _id: string; name: string; email: string; phone?: string } | null;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  failureReason?: string;
};

export type AnnouncementInput = Pick<Announcement, 'title' | 'body'> &
  Partial<Pick<Announcement, 'instruments' | 'isPinned'>>;

export type ResourceInput = Pick<Resource, 'title' | 'instrument' | 'type' | 'url'> & {
  description?: string;
  batchId?: string;
};

export type AdminResource = Omit<Resource, never> & { batch?: { _id: string; title: string } | null };

const query = (params: Record<string, string | number | boolean | undefined>) => {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
};

export const adminService = {
  dashboard: () => api.get<{ stats: AdminStats }>('/admin/dashboard'),

  // Plans
  plans: () => api.get<{ plans: Plan[] }>('/admin/plans'),
  updatePlan: (id: string, body: Partial<Omit<Plan, '_id'>>) => api.patch<{ plan: Plan }>(`/admin/plans/${id}`, body),

  // Batches
  batches: () => api.get<{ batches: AdminBatch[] }>('/admin/batches'),
  createBatch: (body: BatchInput) => api.post<{ batch: AdminBatch }>('/admin/batches', body),
  updateBatch: (id: string, body: Partial<BatchInput>) => api.patch<{ batch: AdminBatch }>(`/admin/batches/${id}`, body),
  /** Soft delete: the batch is hidden from students but history is kept. */
  deactivateBatch: (id: string) => api.delete(`/admin/batches/${id}`),

  // Students & subscriptions
  students: (params: { search?: string; page?: number } = {}) =>
    api.get<{ total: number; page: number; limit: number; students: AdminStudent[] }>(`/admin/students${query(params)}`),
  setStudentActive: (id: string, isActive: boolean) => api.patch(`/admin/students/${id}/status`, { isActive }),
  grantSubscription: (body: { userId: string; instrument: Instrument; planId: string; batchId?: string; days?: number }) =>
    api.post<{ subscription: Subscription }>('/admin/subscriptions', body),
  assignBatch: (subscriptionId: string, batchId: string | null) =>
    api.patch(`/admin/subscriptions/${subscriptionId}/batch`, { batchId }),
  cancelSubscription: (subscriptionId: string) => api.post(`/admin/subscriptions/${subscriptionId}/cancel`),

  // Existing (already-paid) students
  existingStudents: (claimed?: boolean) =>
    api.get<{ count: number; records: ExistingStudentRecord[] }>(`/admin/existing-students${query({ claimed })}`),
  addExistingStudent: (body: ExistingStudentInput) =>
    api.post<{ linkedToExistingAccount: boolean }>('/admin/existing-students', body),
  importExistingStudents: (students: ExistingStudentInput[]) =>
    api.post<{ imported: number; linkedToExistingAccounts: number }>('/admin/existing-students/import', { students }),
  deleteExistingStudent: (id: string) => api.delete(`/admin/existing-students/${id}`),

  // Payments
  payments: (params: { page?: number; status?: Payment['status'] } = {}) =>
    api.get<{ total: number; page: number; limit: number; payments: AdminPayment[] }>(`/admin/payments${query(params)}`),

  // Announcements (listed via the normal /announcements, which returns everything for admins)
  createAnnouncement: (body: AnnouncementInput) => api.post<{ announcement: Announcement }>('/admin/announcements', body),
  updateAnnouncement: (id: string, body: Partial<AnnouncementInput>) =>
    api.patch<{ announcement: Announcement }>(`/admin/announcements/${id}`, body),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

  // Practice material
  resources: () => api.get<{ resources: AdminResource[] }>('/admin/resources'),
  createResource: (body: ResourceInput) => api.post<{ resource: Resource }>('/admin/resources', body),
  deleteResource: (id: string) => api.delete(`/admin/resources/${id}`),
};
