import { api } from '@/lib/api';
import type { Announcement, Resource } from '@/types/api';

export const contentService = {
  announcements: () => api.get<{ announcements: Announcement[] }>('/announcements'),
  resources: () => api.get<{ resources: Resource[]; message?: string }>('/resources'),
};
