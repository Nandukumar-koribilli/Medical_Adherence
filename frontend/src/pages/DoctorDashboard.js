import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getReceivedMessages, sendMessage, getAllUsers } from '../services/api';
import { FaReply, FaSignOutAlt } from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const messagesResponse = await getReceivedMessages();
      const usersResponse = await getAllUsers();
      setReceivedMessages(messagesResponse.data);
      setUsers(usersResponse.data.filter(u => u.role === 'user'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !messageText) {
      alert('Please select a patient and enter a message');
      return;
    }

    try {
      await sendMessage({
        receiverId: selectedPatient,
        subject: 'Doctor Consultation',
        message: messageText,
        messageType: 'recommendation'
      });
      alert('Message sent successfully!');
      setMessageText('');
      setSelectedPatient('');
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">👨‍⚕️ Doctor Dashboard</h1>
            <p className="text-lg mt-2">Welcome, Dr. {user?.name}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-white text-green-500 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'messages'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            Patient Messages
          </button>
          <button
            onClick={() => setActiveTab('reply')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'reply'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            Send Recommendation
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Patient Messages</h2>
            {receivedMessages.length > 0 ? (
              <div className="space-y-4">
                {receivedMessages.map((msg) => (
                  <div key={msg._id} className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded">
                    <p className="font-bold text-gray-800">From: {msg.senderId?.name}</p>
                    <p className="text-gray-600">📧 {msg.senderId?.email}</p>
                    <p className="mt-2 text-gray-700">{msg.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedPatient(msg.senderId._id);
                          setMessageText(`Re: ${msg.subject}\n\n`);
                          setActiveTab('reply');
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition flex items-center gap-1 text-sm"
                      >
                        <FaReply /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No messages yet</p>
            )}
          </div>
        )}

        {/* Reply Tab */}
        {activeTab === 'reply' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Send Recommendation to Patient</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Select Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a patient...</option>
                  {users.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your recommendation or advice..."
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <FaReply /> Send Recommendation
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
