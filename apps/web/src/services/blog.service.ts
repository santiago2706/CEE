import type { BlogPost } from '@cee/types';
import { mockBlogPosts } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  date: string;
  author: string;
}

function formatBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    date: row.date,
    author: row.author,
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

    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw new Error('No se pudieron cargar las entradas del blog.');
    return (data ?? []).map((row) => formatBlogPost(row as BlogPostRow));
  },

  async getLatest(count: number): Promise<BlogPost[]> {
    const posts = await this.getAll();
    return posts.slice(0, count);
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    if (USE_MOCKS) {
      const found = mockBlogPosts.find((post) => post.slug === slug);
      if (!found) throw new Error(`Entrada no encontrada: ${slug}`);
      return delay(found);
    }

    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (error || !data) throw new Error(`Entrada no encontrada: ${slug}`);
    return formatBlogPost(data as BlogPostRow);
  },
};
