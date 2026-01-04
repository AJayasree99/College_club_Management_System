import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const EventCard = React.memo(({ event, isUpcoming, onMarkAttendance }) => {
  const eventDate = new Date(event.date);
  const categoryEmojis = {
    workshop: '🎓',
    seminar: '🎤',
    meetup: '🤝',
    social: '🎉',
  };

  return (
    <div
      className={`rounded-lg shadow-lg p-6 transition-all hover:shadow-xl ${
        isUpcoming ? 'event-upcoming' : 'event-past'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{event.title}</h3>
          <p className="text-sm text-slate-600">
            {eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isUpcoming ? 'badge-upcoming' : 'badge-past'
        }`}>
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>
      </div>

      <p className="text-slate-700 mb-3">
        <strong>Venue:</strong> {event.venue}
      </p>

      <p className="text-slate-700 mb-4">
        <strong>Description:</strong> {event.description}
      </p>

      <div className="event-details-tech rounded p-3 text-sm">
        <p className="text-slate-800 font-semibold">
          Attendance: {event.attendance?.length || 0} marked
        </p>
        {event.attendance && event.attendance.length > 0 && (
          <p className="text-slate-700 text-xs mt-1">
            {event.attendance.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
});

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    venue: '',
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    // Load all events for the club so they are visible for every login
    const eventsRef = collection(db, 'events');

    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleDateChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  }, []);

  const handleVenueChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, venue: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleAddEvent = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.description || !formData.venue) {
      alert('Please fill all fields');
      return;
    }

    const newEvent = {
      ...formData,
      userId: auth.currentUser ? auth.currentUser.uid : null,
      attendance: [],
      createdAt: new Date().toISOString(),
    };

    const tempId = `temp-${Date.now()}`;
    setEvents((prev) => [...prev, { id: tempId, ...newEvent }]);

    setSubmitting(true);
    try {
      const addPromise = addDoc(collection(db, 'events'), newEvent);
      // Clear the form but keep it open so multiple events can be created quickly
      setFormData({ title: '', date: '', description: '', venue: '' });
      setSubmitting(false);
      await addPromise;
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event');
    }
  }, [formData]);

  const handleMarkAttendance = useCallback(async (eventId, memberName) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const event = events.find((e) => e.id === eventId);
      const attendance = event.attendance || [];

      if (attendance.includes(memberName)) {
        await updateDoc(eventRef, {
          attendance: attendance.filter((name) => name !== memberName),
        });
      } else {
        await updateDoc(eventRef, {
          attendance: [...attendance, memberName],
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => new Date(event.date) > now);
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => new Date(event.date) <= now);
  }, [events]);

  return (
    <div>
      {loading && (
        <div className="text-center py-2 text-white text-xs font-semibold">Loading events...</div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Events</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50"
          disabled={submitting}
        >
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Event</h3>
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleTitleChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <input
              type="datetime-local"
              value={formData.date}
              onChange={handleDateChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <input
              type="text"
              placeholder="Venue"
              value={formData.venue}
              onChange={handleVenueChange}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={submitting}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="md:col-span-2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              disabled={submitting}
            ></textarea>
            <button
              type="submit"
              className="md:col-span-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '⏳ Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-slate-600 mb-4 font-semibold">No events found</p>
          <p className="text-slate-500 text-sm">Create your first event to get started</p>
        </div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">📅 Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isUpcoming={true}
                    onMarkAttendance={handleMarkAttendance}
                  />
                ))}
              </div>
            </div>
          )}
          
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">📊 Past Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isUpcoming={false}
                    onMarkAttendance={handleMarkAttendance}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
