import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Members from '../components/Members';
import Events from '../components/Events';
import Feed from '../components/Feed';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-bg min-h-screen">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user || auth.currentUser}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'feed' && <Feed />}
        {activeTab === 'members' && <Members />}
        {activeTab === 'events' && <Events />}
      </div>
    </div>
  );
}
