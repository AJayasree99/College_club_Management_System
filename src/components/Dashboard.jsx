import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // First, try to use cached members from localStorage so the total member
    // count is correct immediately after refresh (Members writes this cache).
    try {
      const cachedMembers = localStorage.getItem('ccms_members');
      if (cachedMembers) {
        const parsed = JSON.parse(cachedMembers);
        if (Array.isArray(parsed)) {
          setStats((prev) => ({
            ...prev,
            totalMembers: parsed.length,
          }));
        }
      }
    } catch (error) {
      console.error('Error reading cached members for dashboard:', error);
    }

    const membersRef = collection(db, 'members');
    const eventsRef = collection(db, 'events');
    const postsRef = collection(db, 'posts');

    // Listen for members changes
    const unsubscribeMembers = onSnapshot(
      membersRef,
      (snapshot) => {
        setStats((prev) => ({
          ...prev,
          totalMembers: snapshot.size,
        }));
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to members:', error);
        setLoading(false);
      }
    );

    // Listen for events changes
    const unsubscribeEvents = onSnapshot(
      eventsRef,
      (snapshot) => {
        const now = new Date();
        let upcomingCount = 0;

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.date) return;
          const eventDate = new Date(data.date);
          if (!Number.isNaN(eventDate.getTime()) && eventDate > now) {
            upcomingCount += 1;
          }
        });

        setStats((prev) => ({
          ...prev,
          totalEvents: snapshot.size,
          upcomingEvents: upcomingCount,
        }));
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to events:', error);
        setLoading(false);
      }
    );

    // Listen for posts changes
    const unsubscribePosts = onSnapshot(
      postsRef,
      (snapshot) => {
        try {
          const posts = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentPosts(posts);
        } catch (error) {
          console.error('Error processing posts for dashboard:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to posts:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeMembers();
      unsubscribeEvents();
      unsubscribePosts();
    };
  }, []);

  return (
    <div>
      {loading && (
        <div className="text-center py-4 text-white text-sm font-semibold">Loading dashboard...</div>
      )}

      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white">Dashboard</h2>
        <p className="text-blue-100 mt-2">Welcome back to your college club management system</p>
      </div>

      <div className="grid-stats">
        <div className="stat-card-members rounded-lg p-8 text-white transform hover:scale-105 transition">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white text-sm font-medium opacity-90 uppercase tracking-wide">Total Members</p>
              <p className="text-5xl font-bold mt-3 text-white">{stats.totalMembers}</p>
            </div>
            <div className="text-7xl opacity-100 drop-shadow-lg">👥</div>
          </div>
          <p className="text-sm text-white font-semibold">Active club members</p>
        </div>

        <div className="stat-card-events rounded-lg p-8 text-white transform hover:scale-105 transition">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white text-sm font-medium opacity-90 uppercase tracking-wide">Total Events</p>
              <p className="text-5xl font-bold mt-3 text-white">{stats.totalEvents}</p>
            </div>
            <div className="text-7xl opacity-100 drop-shadow-lg">📅</div>
          </div>
          <p className="text-sm text-white font-semibold">Events organized</p>
        </div>

        <div className="stat-card-upcoming rounded-lg p-6 text-white transform hover:scale-105 transition">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white text-sm font-medium opacity-90 uppercase tracking-wide">Upcoming Events</p>
              <p className="text-5xl font-bold mt-3 text-white">{stats.upcomingEvents}</p>
            </div>
            <div className="text-7xl opacity-100 drop-shadow-lg">🎯</div>
          </div>
          <p className="text-sm text-white font-semibold">Coming soon</p>
        </div>
      </div>

      <div className="welcome-section">
        <h3 className="text-3xl font-bold mb-6">🎓 Welcome to Your Club Dashboard</h3>
        <p className="text-lg mb-8">
          Efficiently manage your college club with our comprehensive management system. Everything you need to organize, track, and grow your club is right here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-slate-800 font-bold text-lg flex items-center">
              <span className="mr-3">📋</span> Member Management
            </h4>
            <ul className="list-disc list-inside text-slate-700 space-y-3 ml-2">
              <li>Add and manage club members with detailed profiles</li>
              <li>Track member information and joining dates</li>
              <li>Search and filter members by department</li>
              <li>Organize member database efficiently</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-slate-800 font-bold text-lg flex items-center">
              <span className="mr-3">🎪</span> Event Management
            </h4>
            <ul className="list-disc list-inside text-slate-700 space-y-3 ml-2">
              <li>Create and organize club events</li>
              <li>Track event attendance in real-time</li>
              <li>Manage event details and venues</li>
              <li>Get upcoming events overview</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-blue-700 font-bold">💡 Tip:</p>
          <p className="text-blue-600 mt-2">
            Start by adding members in the <span className="font-bold">Members</span> tab, then create events in the <span className="font-bold">Events</span> tab to track attendance and engagement.
          </p>
        </div>
      </div>

      {recentPosts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-white mb-6">📰 Recent Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 line-clamp-2">{post.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-2xl">{post.category === 'announcement' ? '📢' : post.category === 'event' ? '🎪' : post.category === 'news' ? '📰' : post.category === 'discussion' ? '💬' : '🏆'}</span>
                </div>
                <p className="text-slate-700 text-sm line-clamp-3 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex space-x-3">
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>
                  <span className="text-yellow-500">⭐ {post.bookmarks?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
