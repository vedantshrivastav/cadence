import { api } from '@/lib/api';
import type { Announcement, Batch, ClassesPerWeek, Instrument, Plan, ScheduleSlot } from '@/types/api';

export interface AdminStats {
  totalStudents: number;
  activeSubscriptions: number;
  expiringIn7Days: number;
  revenueThisMonthPaise: number;
  paymentsThisMonth: number;
  existingStudentsNotYetSignedUp: number;
}

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

export interface ExistingStudentInput {
  name: string;
  phone: string;
  email?: string;
  instrument: Instrument;
  classesPerWeek: ClassesPerWeek;
  batchId?: string;
  paidUntil: string; // "YYYY-MM-DD"
}

export const adminService = {
  dashboard: () => api.get<{ stats: AdminStats }>('/admin/dashboard'),

  plans: () => api.get<{ plans: Plan[] }>('/admin/plans'),
  updatePlan: (id: string, body: Partial<Omit<Plan, '_id'>>) => api.patch<{ plan: Plan }>(`/admin/plans/${id}`, body),

  batches: () => api.get<{ batches: (Batch & { meetLink: string })[] }>('/admin/batches'),
  createBatch: (body: BatchInput) => api.post<{ batch: Batch }>('/admin/batches', body),
  updateBatch: (id: string, body: Partial<BatchInput>) => api.patch<{ batch: Batch }>(`/admin/batches/${id}`, body),
  deleteBatch: (id: string) => api.delete(`/admin/batches/${id}`),

  students: (params: { search?: string; page?: number } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]),
    ).toString();
    return api.get<{ total: number; page: number; students: unknown[] }>(`/admin/students${qs ? `?${qs}` : ''}`);
  },

  existingStudents: () => api.get<{ records: unknown[] }>('/admin/existing-students'),
  addExistingStudent: (body: ExistingStudentInput) => api.post('/admin/existing-students', body),
  importExistingStudents: (students: ExistingStudentInput[]) =>
    api.post<{ imported: number; linkedToExistingAccounts: number }>('/admin/existing-students/import', { students }),

  payments: (page = 1) => api.get<{ total: number; payments: unknown[] }>(`/admin/payments?page=${page}`),

  createAnnouncement: (body: Pick<Announcement, 'title' | 'body'> & Partial<Pick<Announcement, 'instruments' | 'isPinned'>>) =>
    api.post<{ announcement: Announcement }>('/admin/announcements', body),
};
