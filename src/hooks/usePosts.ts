import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types';

type Post = Database['public']['Tables']['posts']['Row'];

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();

    const postsChannel = supabase.channel('posts_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('Posts change received:', payload);
          await fetchPosts();
        }
      )
      .subscribe((status) => {
        console.log('Posts subscription status:', status);
      });

    return () => {
      postsChannel.unsubscribe();
    };
  }, []);

  async function createPost(title: string, content: string, imageUrl?: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase.from('posts').insert({
        title,
        content,
        image_url: imageUrl,
        user_id: userData.user.id,
      });

      if (insertError) throw insertError;
      await fetchPosts();
    } catch (err) {
      console.error('Error saving post:', err);
      throw err;
    }
  }

  async function updatePost(postId: string, title: string, content: string) {
    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ title, content })
        .eq('id', postId);

      if (updateError) throw updateError;
      await fetchPosts();
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  }

  async function deletePost(postId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) throw deleteError;
      await fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  }

  return { posts, loading, error, createPost, updatePost, deletePost };
}