import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAds,
  fetchAllAdsAdmin,
  upsertAd,
  toggleAdActive,
  deleteAd,
  SiteAd,
} from '@/services/adsService';

// ─── Public: fetch ads for a specific slot ───────────────────────────────────

export function useAds(page: string, position: string) {
  return useQuery({
    queryKey: ['site_ads', page, position],
    queryFn: () => fetchAds(page, position),
    staleTime: 60_000, // 1 minute — ads don't change frequently
  });
}

// ─── Admin: fetch all ads ─────────────────────────────────────────────────────

export function useAllAdsAdmin() {
  return useQuery({
    queryKey: ['site_ads_admin'],
    queryFn: fetchAllAdsAdmin,
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export function useUpsertAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteAd> & { id?: string }) => upsertAd(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_ads_admin'] });
      qc.invalidateQueries({ queryKey: ['site_ads'] });
    },
  });
}

export function useToggleAdActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleAdActive(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_ads_admin'] });
      qc.invalidateQueries({ queryKey: ['site_ads'] });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_ads_admin'] });
      qc.invalidateQueries({ queryKey: ['site_ads'] });
    },
  });
}
