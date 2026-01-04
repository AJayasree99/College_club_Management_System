import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchNotifications = async () => {
      try {
        // Get recent posts from clubs
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '!=', auth.currentUser.uid)
        );
        const postsSnapshot = await getDocs(postsQuery);
        
        const notificationsData = postsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            type: 'post',
            message: `New post: ${doc.data().title}`,
            timestamp: doc.data().createdAt,
            read: false,
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        setNotifications(notificationsData);
        setUnreadCount(notificationsData.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return { notifications, unreadCount };
}
