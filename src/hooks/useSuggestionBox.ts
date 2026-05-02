import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBoxSettings,
  fetchAllBoxSettings,
  upsertBoxSetting,
  seedDefaultBoxSettings,
  BoxType,
} from '@/services/suggestionBoxService';

// ─── Public: check if boxes are active for a given page ───────────────────────

export function useSuggestionBoxSettings(pageKey: string) {
  return useQuery({
    queryKey: ['suggestion_box_settings', pageKey],
    queryFn:  () => fetchBoxSettings(pageKey),
    staleTime: 60_000, // 1 minute cache
  });
}

// ─── Admin: fetch all settings ────────────────────────────────────────────────

export function useAllBoxSettingsAdmin() {
  return useQuery({
    queryKey: ['suggestion_box_settings_admin'],
    queryFn:  fetchAllBoxSettings,
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export function useToggleBoxSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      page_key,
      box_type,
      is_active,
    }: {
      page_key: string;
      box_type: BoxType;
      is_active: boolean;
    }) => upsertBoxSetting(page_key, box_type, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suggestion_box_settings_admin'] });
      qc.invalidateQueries({ queryKey: ['suggestion_box_settings'] });
    },
  });
}

export function useSeedBoxSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedDefaultBoxSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suggestion_box_settings_admin'] });
    },
  });
}
