import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { uploadMedicine, getAllMedicines, updateMedicineStock, getAllUsers, assignPatient } from '../services/api';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaSignOutAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicines');
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    description: '',
    price: '',
    manufacturer: '',
    category: '',
    image: null
  });
  const [assignmentData, setAssignmentData] = useState({
    doctorId: '',
    patientId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const medicinesResponse = await getAllMedicines();
      const usersResponse = await getAllUsers();
      setMedicines(medicinesResponse.data);
      setDoctors(usersResponse.data.filter(u => u.role === 'doctor'));
      setPatients(usersResponse.data.filter(u => u.role === 'user'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      await uploadMedicine(data);
      alert('Medicine uploaded successfully!');
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        description: '',
        price: '',
        manufacturer: '',
        category: '',
        image: null
      });
      fetchData();
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to upload medicine');
    }
  };

  const handleToggleStock = async (medicineId, currentStatus) => {
    try {
      await updateMedicineStock(medicineId, { inStock: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    try {
      await assignPatient(assignmentData);
      alert('Patient assigned to doctor successfully!');
      setAssignmentData({ doctorId: '', patientId: '' });
      fetchData();
    } catch (error) {
      console.error('Error assigning patient:', error);
      alert('Failed to assign patient');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">⚙️ Admin Dashboard</h1>
            <p className="text-lg mt-2">Manage medicines, doctors, and patients</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-white text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'medicines'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Manage Medicines
          </button>
          <button
            onClick={() => setActiveTab('add-medicine')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'add-medicine'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Add Medicine
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'assign'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Assign Patient
          </button>
        </div>

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Medicine Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-3 text-left">Name</th>
                    <th className="border p-3 text-left">Dosage</th>
                    <th className="border p-3 text-left">Price</th>
                    <th className="border p-3 text-left">Stock</th>
                    <th className="border p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine) => (
                    <tr key={medicine._id} className="hover:bg-gray-50">
                      <td className="border p-3">{medicine.name}</td>
                      <td className="border p-3">{medicine.dosage}</td>
                      <td className="border p-3">₹{medicine.price}</td>
                      <td className="border p-3">
                        <span className={`px-3 py-1 rounded-full text-white ${
                          medicine.inStock ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="border p-3 flex gap-2">
                        <button
                          onClick={() => handleToggleStock(medicine._id, medicine.inStock)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {medicine.inStock ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Medicine Tab */}
        {activeTab === 'add-medicine' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Medicine</h2>
            <form onSubmit={handleAddMedicine} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Medicine Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Aspirin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleFormChange}
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Frequency</label>
                  <input
                    type="text"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleFormChange}
                    placeholder="e.g., Twice daily"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleFormChange}
                    placeholder="e.g., Pharma Ltd"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    placeholder="e.g., Pain Relief"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Medicine details..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Medicine Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <FaPlus /> Upload Medicine
              </button>
            </form>
          </div>
        )}

        {/* Assign Patient Tab */}
        {activeTab === 'assign' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Assign Patient to Doctor</h2>
            <form onSubmit={handleAssignPatient} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Select Doctor</label>
                <select
                  value={assignmentData.doctorId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Select Patient</label>
                <select
                  value={assignmentData.patientId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, patientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Choose a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Assign Patient
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
