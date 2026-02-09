'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api';

/** CMS API response: content grouped by section_key -> field_key -> { value, field_type } */
export type CmsContentBySection = Record<string, Record<string, { value: string; field_type?: string }>>;

export interface UseCmsContentResult {
  content: CmsContentBySection | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches CMS content for a page from GET /api/cms/:pageKey.
 * Use the returned content to override translation strings so admin edits reflect on the frontend.
 */
export function useCmsContent(pageKey: string): UseCmsContentResult {
  const [content, setContent] = useState<CmsContentBySection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(getApiUrl(`api/cms/${encodeURIComponent(pageKey)}`))
      .then((res) => {
        if (!res.ok) throw new Error(`CMS fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: { content?: CmsContentBySection }) => {
        if (cancelled) return;
        setContent(data.content ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load CMS content');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pageKey]);

  return { content, loading, error };
}

/**
 * Get a single CMS field value. Returns CMS value if present, otherwise undefined (caller should fall back to translation).
 */
export function getCmsValue(
  content: CmsContentBySection | null,
  sectionKey: string,
  fieldKey: string
): string | undefined {
  if (!content?.[sectionKey]?.[fieldKey]) return undefined;
  const v = content[sectionKey][fieldKey].value;
  return v == null ? undefined : String(v);
}

/**
 * Get CMS value or fallback. Use in components: cmsOrT(content, 'TopBar', 'home', t('home')).
 */
export function cmsOrT(
  content: CmsContentBySection | null,
  sectionKey: string,
  fieldKey: string,
  fallback: string
): string {
  const cms = getCmsValue(content, sectionKey, fieldKey);
  return (cms != null && cms !== '') ? cms : fallback;
}
