import { api } from '@/lib/api';
import type { Batch, ClassesPerWeek, Instrument, MyClass, Plan, Subscription } from '@/types/api';

export const classesService = {
  plans: () => api.get<{ plans: Plan[] }>('/plans'),

  /** Public batch timings (no Meet links) for picking a slot before paying. */
  batches: (filter: { instrument?: Instrument; classesPerWeek?: ClassesPerWeek } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filter).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
    ).toString();
    return api.get<{ batches: Batch[] }>(`/batches${qs ? `?${qs}` : ''}`);
  },

  myClasses: () =>
    api.get<{ hasActiveSubscription: boolean; subscriptions?: Subscription[]; classes: MyClass[] }>(
      '/classes/me',
    ),

  /** Records attendance and returns the Meet link to open. */
  join: (batchId: string) => api.post<{ meetLink: string }>(`/classes/${batchId}/join`),

  myAttendance: () =>
    api.get<{ count: number; attendance: { _id: string; date: string; batch: Pick<Batch, '_id' | 'title' | 'instrument'> }[] }>(
      '/attendance/me',
    ),
};
