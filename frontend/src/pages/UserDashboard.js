import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMedicineStore, addMedicineToUser, logAdherence } from '../services/api';
import { FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const [userMedicines, setUserMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchMedicines();
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

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <h1 className="text-4xl font-bold">👋 Welcome, {user?.name}!</h1>
        <p className="text-lg mt-2">Manage your medicines and track your adherence</p>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'store'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Medicine Store
          </button>
          <button
            onClick={() => setActiveTab('my-medicines')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'my-medicines'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Medicines
          </button>
        </div>

        {/* Medicine Store Tab */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div key={medicine._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
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
      </div>
    </div>
  );
};

export default UserDashboard;
