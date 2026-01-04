import React from 'react';

export default function Navigation({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav className="nav-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🎓</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">College</h1>
                <p className="text-xs text-purple-600 font-bold">Club Manager</p>
              </div>
            </div>

            <div className="hidden md:flex space-x-2 border-l border-r border-slate-200 px-4 py-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  activeTab === 'feed'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span>📰</span>
                <span>Feed</span>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  activeTab === 'members'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <span>👥</span>
                <span>Members</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>🎪</span>
                <span>Events</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-slate-800 text-sm font-bold">{user?.email}</p>
              <p className="text-blue-600 text-xs font-semibold">Club Manager</p>
            </div>
            <div className="w-px h-8 bg-slate-300"></div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
