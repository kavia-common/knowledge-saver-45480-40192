import { supabase } from './supabase/client';

export type ClipItem = {
  id: string;
  user_id: string;
  url: string;
  title?: string | null;
  source?: 'reddit' | 'x' | 'youtube' | 'web' | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  tags?: string[] | null;
};

const TABLE = 'clips';

type ListQuery = { q?: string; source?: string | null; sort?: 'new' | 'old' };

// PUBLIC_INTERFACE
export async function addClip(input: Omit<ClipItem, 'id' | 'user_id' | 'created_at'>): Promise<ClipItem> {
  /** Insert a new clip for the current user via PostgREST. */
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  const payload: Omit<ClipItem, 'id' | 'created_at'> = {
    url: input.url,
    title: input.title ?? null,
    source: input.source ?? null,
    summary: input.summary ?? null,
    metadata: (input.metadata ?? null) as Record<string, unknown> | null,
    tags: input.tags ?? null,
    user_id: userData.user.id,
  };
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
  if (error) throw error;
  return data as ClipItem;
}

// PUBLIC_INTERFACE
export async function listClips(query?: ListQuery): Promise<ClipItem[]> {
  /** Query clips for the current user with basic filters and search. */
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  let req = supabase.from(TABLE).select('*').eq('user_id', userData.user.id);

  if (query?.source) req = req.eq('source', query.source);
  if (query?.q) {
    // simple ilike search against title and summary
    req = req.or(`title.ilike.%${query.q}%,summary.ilike.%${query.q}%`);
  }
  if (query?.sort === 'old') req = req.order('created_at', { ascending: true });
  else req = req.order('created_at', { ascending: false });

  const { data, error } = await req;
  if (error) throw error;
  return data as ClipItem[];
}

// PUBLIC_INTERFACE
export async function getClip(id: string) {
  /** Get a single clip by id for current user. */
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).eq('user_id', userData.user.id).single();
  if (error) throw error;
  return data as ClipItem;
}

// PUBLIC_INTERFACE
export async function deleteClip(id: string) {
  /** Delete a clip owned by current user. */
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', userData.user.id);
  if (error) throw error;
}

// PUBLIC_INTERFACE
export async function upsertSummary(id: string, summary: string) {
  /** Update a clip summary field. */
  const { error } = await supabase.from(TABLE).update({ summary }).eq('id', id);
  if (error) throw error;
}

// PUBLIC_INTERFACE
export async function graphQLSearch(q: string) {
  /** Optional GraphQL example using Supabase GraphQL endpoint. Requires enabled GraphQL. */
  const graphqlUrl = `${(supabase as unknown as { supabaseUrl: string }).supabaseUrl}/graphql/v1`;
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      apikey: (supabase as unknown as { supabaseKey: string }).supabaseKey,
      Authorization: `Bearer ${(supabase as unknown as { supabaseKey: string }).supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query SearchClips($pattern: String!) {
          clipsCollection(filter:{
            title: { ilike: $pattern }
          }, orderBy: [{ created_at: DescNullsLast }]) {
            edges { node { id url title source summary created_at } }
          }
        }`,
      variables: { pattern: `%${q}%` },
    }),
  });
  if (!res.ok) throw new Error('GraphQL request failed');
  const json: unknown = await res.json();
  const edges: unknown = (json as { data?: { clipsCollection?: { edges?: Array<{ node: ClipItem }> } } }).data?.clipsCollection?.edges ?? [];
  const nodes = Array.isArray(edges) ? edges.map((e) => (e as { node: ClipItem }).node) : [];
  return nodes;
}
