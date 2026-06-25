import type { BlogPost } from '@cee/types';
import { mockBlogPosts } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface BlogPostRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  date: string;
  slug: string;
}

function formatBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    date: row.date,
    slug: row.slug,
  };
}

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const blogService = {
  async getAll(): Promise<BlogPost[]> {
    if (USE_MOCKS) {
      return delay(sortByDateDesc(mockBlogPosts));
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error('No se pudieron cargar las entradas del blog.');
    return (data ?? []).map((row) => formatBlogPost(row as BlogPostRow));
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (USE_MOCKS) {
      return delay(mockBlogPosts.find((post) => post.slug === slug) ?? null);
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error('No se pudo cargar la entrada del blog.');
    return data ? formatBlogPost(data as BlogPostRow) : null;
  },
};
