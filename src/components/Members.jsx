import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const MemberRow = React.memo(({ member, onDelete }) => (
  <tr className="border-b hover:bg-blue-50 transition">
    <td className="px-6 py-4 text-slate-800">{member.name}</td>
    <td className="px-6 py-4 text-slate-800">{member.email}</td>
    <td className="px-6 py-4 text-slate-800">{member.department}</td>
    <td className="px-6 py-4 text-slate-800">{member.joiningDate}</td>
    <td className="px-6 py-4">
      <button
        onClick={() => onDelete(member.id)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-bold"
      >
        Delete
      </button>
    </td>
  </tr>
));

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    joiningDate: '',
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    // First try to load cached members from localStorage for fast reloads
    const cached = localStorage.getItem('ccms_members');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setMembers(parsed);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing cached members:', error);
      }
    }

    // Then subscribe to Firestore to keep data in sync and persistent in the cloud
    // Load all members for the club so data is shared across logins
    const membersRef = collection(db, 'members');

    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const membersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
      try {
        localStorage.setItem('ccms_members', JSON.stringify(membersData));
      } catch (error) {
        console.error('Error caching members to localStorage:', error);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching members:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleNameChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleEmailChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleDepartmentChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, department: e.target.value }));
  }, []);

  const handleJoiningDateChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, joiningDate: e.target.value }));
  }, []);

  const handleAddMember = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department || !formData.joiningDate) {
      alert('Please fill all fields');
      return;
    }

    const newMember = {
      ...formData,
      userId: auth.currentUser ? auth.currentUser.uid : null,
      createdAt: new Date().toISOString(),
    };

    const tempId = `temp-${Date.now()}`;
    setMembers((prev) => [...prev, { id: tempId, ...newMember }]);
    
    setSubmitting(true);
    try {
      const addPromise = addDoc(collection(db, 'members'), newMember);
      // Clear the form but keep it open so multiple members can be added quickly
      setFormData({ name: '', email: '', department: '', joiningDate: '' });
      // Stop showing the ADDING... state immediately; Firestore will finish in background
      setSubmitting(false);
      await addPromise;
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member');
    }
  }, [formData]);

  const handleDeleteMember = useCallback(async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    // Optimistic update: remove from local list immediately
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== memberId);
      try {
        localStorage.setItem('ccms_members', JSON.stringify(updated));
      } catch (error) {
        console.error('Error caching members after delete:', error);
      }
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'members', memberId));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
      // If delete fails, reload from Firestore cache on next snapshot; meanwhile we can
      // try to restore from localStorage snapshot
      try {
        const cached = localStorage.getItem('ccms_members');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setMembers(parsed);
          }
        }
      } catch (e) {
        console.error('Error restoring members after failed delete:', e);
      }
    }
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {loading && (
        <div className="text-center py-2 text-white text-xs font-semibold">Loading members...</div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Club Members</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50"
          disabled={submitting}
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {showForm && (
        <div className="dark-card rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Member</h3>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleNameChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleEmailChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={handleDepartmentChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <input
              type="date"
              value={formData.joiningDate}
              onChange={handleJoiningDateChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <button
              type="submit"
              className="md:col-span-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '⏳ Adding...' : 'Add Member'}
            </button>
          </form>
        </div>
      )}

      <div className="dark-card rounded-lg p-6 mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <p className="text-slate-600 text-center py-8 font-semibold">No members found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Joining Date</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onDelete={handleDeleteMember}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
