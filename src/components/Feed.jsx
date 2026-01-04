import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const PostCard = React.memo(({ post, onLike, onBookmark, onDelete }) => {
  const isLiked = post.likes?.includes(auth.currentUser.uid);
  const isBookmarked = post.bookmarks?.includes(auth.currentUser.uid);
  const categoryEmojis = {
    announcement: '📢',
    event: '🎪',
    news: '📰',
    discussion: '💬',
    achievement: '🏆',
  };

  return (
    <div className="post-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{categoryEmojis[post.category] || '📝'}</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {post.category}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{post.title}</h3>
          <p className="text-slate-500 text-sm">
            {new Date(post.createdAt).toLocaleDateString()} at{' '}
            {new Date(post.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => onDelete(post.id)}
          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-bold"
        >
          🗑️
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike(post.id, post.likes)}
            className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition group"
          >
            <span className={`text-xl group-hover:scale-125 transition ${isLiked ? 'text-red-500' : ''}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className={`font-bold ${isLiked ? 'text-red-500' : ''}`}>
              {post.likes?.length || 0}
            </span>
          </button>

          <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition group">
            <span className="text-xl group-hover:scale-125 transition">💬</span>
            <span className="font-bold">{post.comments?.length || 0}</span>
          </button>

          <button className="flex items-center space-x-2 text-slate-600 hover:text-green-500 transition group">
            <span className="text-xl group-hover:scale-125 transition">📤</span>
            <span className="font-bold">Share</span>
          </button>
        </div>

        <button
          onClick={() => onBookmark(post.id, post.bookmarks)}
          className={`flex items-center space-x-2 transition group ${
            isBookmarked ? 'text-yellow-500' : 'text-slate-600 hover:text-yellow-500'
          }`}
        >
          <span className="text-xl group-hover:scale-125 transition">
            {isBookmarked ? '⭐' : '☆'}
          </span>
        </button>
      </div>
    </div>
  );
});

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement',
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);
    // Load all posts for the club so feed is shared across logins
    const postsRef = collection(db, 'posts');

    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      try {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  }, []);

  const handleContentChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  }, []);

  const handleAddPost = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill all fields');
      return;
    }

    const newPost = {
      ...formData,
      userId: auth.currentUser ? auth.currentUser.uid : null,
      likes: [],
      comments: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };

    const tempId = `temp-${Date.now()}`;
    setPosts((prev) => [{ id: tempId, ...newPost }, ...prev]);

    setSubmitting(true);
    try {
      const addPromise = addDoc(collection(db, 'posts'), newPost);
      setFormData({ title: '', content: '', category: 'announcement' });
      setShowForm(false);
      setSubmitting(false);
      await addPromise;
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Error creating post');
    }
  }, [formData]);

  const handleLikePost = useCallback(async (postId, currentLikes) => {
    try {
      const userLikes = currentLikes || [];
      const isLiked = userLikes.includes(auth.currentUser.uid);
      
      await updateDoc(doc(db, 'posts', postId), {
        likes: isLiked
          ? userLikes.filter((id) => id !== auth.currentUser.uid)
          : [...userLikes, auth.currentUser.uid],
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, []);

  const handleBookmarkPost = useCallback(async (postId, currentBookmarks) => {
    try {
      const userBookmarks = currentBookmarks || [];
      const isBookmarked = userBookmarks.includes(auth.currentUser.uid);
      
      await updateDoc(doc(db, 'posts', postId), {
        bookmarks: isBookmarked
          ? userBookmarks.filter((id) => id !== auth.currentUser.uid)
          : [...userBookmarks, auth.currentUser.uid],
      });
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  }, []);

  const handleDeletePost = useCallback(async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  }, []);

  return (
    <div>
      {loading && (
        <div className="text-center py-2 text-white text-xs font-semibold">Loading posts...</div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-white">Club Feed</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>{showForm ? 'Cancel' : '+ New Post'}</span>
        </button>
      </div>

      {showForm && (
        <div className="dark-card rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Share with Your Club</h3>
          <form onSubmit={handleAddPost} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold mb-2">Post Title</label>
              <input
                type="text"
                placeholder="What's on your mind?"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 rounded-lg"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-lg"
                disabled={submitting}
              >
                <option value="announcement">📢 Announcement</option>
                <option value="event">🎪 Event</option>
                <option value="news">📰 News</option>
                <option value="discussion">💬 Discussion</option>
                <option value="achievement">🏆 Achievement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">Content</label>
              <textarea
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={handleContentChange}
                className="w-full px-4 py-3 rounded-lg"
                rows="5"
                disabled={submitting}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '⏳ Sharing...' : 'Share Post'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="dark-card rounded-lg p-12 text-center">
            <p className="text-slate-600 text-lg">No posts yet. Be the first to share! 📝</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLikePost}
              onBookmark={handleBookmarkPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
}
