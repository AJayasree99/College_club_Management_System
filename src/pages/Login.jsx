import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center px-8 py-6 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="text-3xl">🎓</div>
          <span className="text-white font-bold text-xl">ClubCMS</span>
        </div>
        <div className="flex items-center space-x-6 text-white text-sm">
          <a href="#" className="hover:text-blue-400 transition">Home</a>
          <a href="#" className="hover:text-blue-400 transition">Clubs</a>
          <a href="#" className="hover:text-blue-400 transition">About Us</a>
          <a href="#" className="hover:text-blue-400 transition">Dashboard</a>
        </div>
      </nav>

      {/* Main Hero Section */}
      <div className="flex-1 flex items-center justify-between px-8 py-12 relative overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Content */}
        <div className="w-1/2 z-10">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Your <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Campus</span>, Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Club</span> Community
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl">
            Discover, join, and thrive in Sai Vidya Institute of Technology's vibrant club ecosystem. Connect with peers, organize events, and build lasting communities.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-blue-50 shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            GET STARTED →
          </button>
        </div>

        {/* Right Illustration */}
        <div className="w-1/2 flex justify-center items-center relative">
          <div className="relative w-80 h-80">
            {/* Decorative circles and shapes */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            
            {/* Illustration Placeholder with Icons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl">👥</div>
              <div className="text-5xl">🎯</div>
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Bottom Section */}
      <div className="relative w-full mt-auto">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-900 to-slate-50"></div>
        <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 Q360,0 720,40 T1440,40 L1440,120 L0,120 Z" fill="rgba(248, 250, 252, 1)" />
        </svg>
        
        <div className="bg-slate-50 pt-24 pb-12 px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-slate-600 text-center mb-8 font-semibold">
              Community. People. Support.
            </p>
            <p className="text-center text-slate-600 mb-12">
              As featured with <span className="text-blue-600 font-bold">growth</span> partner
            </p>
            
            {/* Partner Logos */}
            <div className="flex justify-center items-center space-x-12 flex-wrap gap-6">
              <div className="text-2xl font-bold text-slate-400">🏫 Ernesis</div>
              <div className="text-2xl font-bold text-slate-400">💰 Financially</div>
              <div className="text-2xl font-bold text-slate-400">🧠 Brain Station</div>
              <div className="text-2xl font-bold text-slate-400">📷 Camera</div>
              <div className="text-2xl font-bold text-slate-400">🍽️ Cafelo</div>
              <div className="text-2xl font-bold text-slate-400">💻 Software</div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600 mb-8">Sign in to your club management account</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition transform hover:scale-105"
              >
                {loading ? '⏳ Logging in...' : 'Sign In'}
              </button>

              <p className="text-center text-slate-600 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition">
                  Register Here
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
