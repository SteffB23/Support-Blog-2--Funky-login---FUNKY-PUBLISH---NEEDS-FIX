import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import Comment from './Comment';

export default function PostList() {
  const { posts, loading, error, updatePost, deletePost } = usePosts();
  const { user } = useAuth();
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  if (loading) {
    return <div className="text-gray-600">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-gray-600">No posts yet. Be the first to create one!</div>;
  }

  const handleEdit = (post: any) => {
    setEditingPost(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSave = async (postId: string) => {
    try {
      await updatePost(postId, editTitle, editContent);
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            {editingPost === post.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="inline-flex items-center p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => handleSave(post.id)}
                    className="inline-flex items-center p-1 text-green-500 hover:text-green-700"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  {user && post.user_id === user.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  by {post.profiles?.username || 'Anonymous'}
                </p>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <Comment postId={post.id} />
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}