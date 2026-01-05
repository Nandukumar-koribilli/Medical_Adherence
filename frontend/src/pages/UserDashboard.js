import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMedicineStore, addMedicineToUser, getUserMedicines, logAdherence, sendMessage, getAssignedDoctor } from '../services/api';
import { FaPlus, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [userMedicines, setUserMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchMedicines();
    fetchUserMedicines();
    fetchAssignedDoctor();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await getMedicineStore();
      setMedicines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setLoading(false);
    }
  };

  const fetchUserMedicines = async () => {
    try {
      const response = await getUserMedicines();
      setUserMedicines(response.data);
    } catch (error) {
      console.error('Error fetching user medicines:', error);
    }
  };

  const fetchAssignedDoctor = async () => {
    try {
      const response = await getAssignedDoctor();
      setAssignedDoctor(response.data);
    } catch (error) {
      console.error('Error fetching assigned doctor:', error);
    }
  };

  const handleAddMedicine = async (medicineId) => {
    try {
      await addMedicineToUser({
        medicineId,
        dosage: '1 tablet',
        frequency: 'Twice daily',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        timeSlots: ['08:00', '20:00']
      });
      alert('Medicine added successfully!');
      fetchMedicines();
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine');
    }
  };

  const handleLogAdherence = async (medicineId, status) => {
    try {
      await logAdherence({
        medicineId,
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        status,
        dosage: '1 tablet'
      });
      alert(`Medicine marked as ${status}!`);
    } catch (error) {
      console.error('Error logging adherence:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!assignedDoctor || !messageText) {
      alert('No assigned doctor or message is empty');
      return;
    }

    try {
      await sendMessage({
        receiverId: assignedDoctor._id,
        subject: 'Patient Inquiry',
        message: messageText,
        messageType: 'inquiry'
      });
      alert('Message sent to doctor successfully!');
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">👋 Welcome, {user?.name}!</h1>
            <p className="text-lg mt-2">Manage your medicines and track your adherence</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'store'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            Medicine Store
          </button>
          <button
            onClick={() => setActiveTab('my-medicines')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'my-medicines'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            My Medicines
          </button>
          <button
            onClick={() => setActiveTab('contact-doctor')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'contact-doctor'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            Contact Doctor
          </button>
        </div>

        {/* Medicine Store Tab */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div key={medicine._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                {medicine.image && (
                  <img src={medicine.image} alt={medicine.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{medicine.name}</h3>
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Dosage:</span> {medicine.dosage}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Frequency:</span> {medicine.frequency}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Price:</span> ₹{medicine.price}
                </p>
                <p className="text-gray-600 mb-4">{medicine.description}</p>
                <button
                  onClick={() => handleAddMedicine(medicine._id)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <FaPlus /> Add Medicine
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Medicines Tab */}
        {activeTab === 'my-medicines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userMedicines.length > 0 ? (
              userMedicines.map((userMedicine) => (
                <div key={userMedicine._id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {userMedicine.medicineId?.name}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleLogAdherence(userMedicine.medicineId._id, 'taken')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle /> Taken
                    </button>
                    <button
                      onClick={() => handleLogAdherence(userMedicine.medicineId._id, 'missed')}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle /> Missed
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-2">No medicines added yet</p>
            )}
          </div>
        )}

        {/* Contact Doctor Tab */}
        {activeTab === 'contact-doctor' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Contact Your Doctor</h2>
            {assignedDoctor ? (
              <div className="mb-4">
                <p className="text-gray-700">
                  <strong>Assigned Doctor:</strong> Dr. {assignedDoctor.name} ({assignedDoctor.email})
                </p>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No doctor assigned yet. Please contact admin for assignment.</p>
            )}
            {assignedDoctor && (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Message</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter your message to the doctor..."
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Send Message
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
