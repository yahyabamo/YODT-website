import { useQuery } from '@tanstack/react-query';
import { fetchAllSubmissions, fetchSubmissionById } from '@/services/studentProjectsService';
import type { ProjectSubmission } from '@/services/studentProjectsService';

/** Admin: all submissions, optionally filtered by status */
export const useAllSubmissions = (status?: ProjectSubmission['status']) =>
  useQuery({
    queryKey: ['project_submissions', status ?? 'all'],
    queryFn: async () => {
      const { data, error } = await fetchAllSubmissions(status);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 1,
  });

/** Admin: single submission by id */
export const useSubmissionById = (id: string) =>
  useQuery({
    queryKey: ['project_submission', id],
    queryFn: async () => {
      const { data, error } = await fetchSubmissionById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });
