import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types';

type Comment = Database['public']['Tables']['comments']['Row'];

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchComments() {
    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();

    const commentsChannel = supabase.channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          console.log('Comments change received:', payload);
          await fetchComments();
        }
      )
      .subscribe((status) => {
        console.log('Comments subscription status:', status);
      });

    return () => {
      commentsChannel.unsubscribe();
    };
  }, [postId]);

  async function addComment(content: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase.from('comments').insert({
        content,
        post_id: postId,
        user_id: userData.user.id,
      });

      if (insertError) throw insertError;
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }

  return { comments, loading, error, addComment };
}