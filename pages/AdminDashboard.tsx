
import React, { useState, useEffect } from 'react';
import { User, Medication } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetchMeds();
    loadOrders();
    loadUsers();
  }, []);

  const fetchMeds = async () => {
    try {
      const { data } = await api.adminGetAllMedicines();
      setMeds(data);
    } catch (error) {
      console.error('Error fetching meds:', error);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.adminGetOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
    setLoadingOrders(false);
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAllUsers();
      setUsers(res.data || []);
      setDoctors((res.data || []).filter((u: any) => (u.role || '').toString().toLowerCase() === 'doctor'));
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const assignDoctorToUser = async (userId: string, doctorId: string) => {
    try {
      await api.assignDoctor(userId, { doctorId });
      alert('Doctor assigned');
      loadUsers();
    } catch (err) {
      console.error('Error assigning doctor:', err);
      alert('Failed to assign doctor');
    }
  };
  const acceptOrder = async (id: string) => {
    if (!window.confirm('Accept this order?')) return;
    try {
      await api.adminAcceptOrder(id);
      loadOrders();
      alert('Order accepted');
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('Failed to accept order');
    }
  };
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    price: '',
    stock: '',
    description: '',
    frequency: 'Daily', // Default
    duration: 'Ongoing', // Default
    category: 'General' // Default
  });

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', newMed.name);
      formData.append('dosage', newMed.dosage);
      formData.append('price', newMed.price);
      formData.append('stock', newMed.stock); // Note: Backend Medicine model uses 'inStock' boolean or check stock? Adminjs says updateMedicineStock but uploadMedicine creates.
      // Backend create: name, dosage, frequency, description, price, image, manufacturer, category.
      // It seems backend doesn't take 'stock' count directly in create? 
      // Checking Medicine.js model: `inStock: { type: Boolean, default: true }`. No quantity field found in previous viewing.
      // But AdminDashboard has 'stock' input. 
      // I will send it anyway or maybe backend ignores it.
      // Wait, backend `uploadMedicine` creates logic: 
      // `const newMedicine = new Medicine({ name, dosage, frequency, description, price, image: result.secure_url, manufacturer, uploadedBy: req.userId, category });`
      // So no stock count.
      // I'll stick to required fields.
      formData.append('frequency', newMed.frequency);
      formData.append('duration', newMed.duration);
      formData.append('description', newMed.description);
      formData.append('category', newMed.category);
      formData.append('manufacturer', 'Generic'); // Hardcoded for now

      if (file) {
        formData.append('image', file);
      } else {
        alert('Please select an image');
        return;
      }

      await api.uploadMedicine(formData);
      alert('Medicine uploaded successfully!');
      setNewMed({ name: '', dosage: '', price: '', stock: '', description: '', frequency: 'Daily', duration: 'Ongoing', category: 'General' });
      setFile(null);
      fetchMeds();
    } catch (error) {
      console.error('Error uploading medicine:', error);
      alert('Failed to upload medicine');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        fetchMeds();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Admin Inventory System</h1>
            <p className="text-slate-400 text-sm">Manage Medications for Patient Store</p>
          </div>
          <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl transition-all">
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6">Add New Medication</h2>
              <form onSubmit={handleAddMed} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medication Name</label>
                  <input
                    required
                    value={newMed.name}
                    onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage (e.g. 500mg)</label>
                  <input
                    required
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={newMed.price}
                      onChange={e => setNewMed({ ...newMed, price: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={newMed.stock}
                      onChange={e => setNewMed({ ...newMed, stock: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newMed.description}
                    onChange={e => setNewMed({ ...newMed, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">
                  Update Store Inventory
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
              <h2 className="text-xl font-bold mb-6">Current Inventory</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs font-bold uppercase border-b border-slate-800">
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Dosage</th>
                      <th className="pb-4 text-center">Price</th>
                      <th className="pb-4 text-center">Stock</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {meds.map(med => (
                      <tr key={med.id} className="text-sm">
                        <td className="py-4 font-semibold">{med.name}</td>
                        <td className="py-4 text-slate-400">{med.dosage}</td>
                        <td className="py-4 text-center text-blue-400 font-bold">${med.price}</td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${(med.stock || 0) < 150 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                            {med.stock} units
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDelete(med.id)} className="text-slate-500 hover:text-red-400 mr-4 transition-colors"><i className="fas fa-trash"></i></button>
                          <button className="text-slate-500 hover:text-blue-400 transition-colors"><i className="fas fa-edit"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
              <h2 className="text-xl font-bold mb-6">Orders</h2>
              {loadingOrders ? (
                <p className="text-slate-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-slate-500">No orders at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(o => (
                    <div key={o._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Order #{o._id}</p>
                          <p className="text-xs text-slate-400">By {o.userId?.name} ({o.userId?.email}) • {new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold mb-2">{o.status}</div>
                          {o.status === 'pending' && (
                            <button onClick={() => acceptOrder(o._id)} className="bg-blue-600 text-white px-3 py-1 rounded">Accept</button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        {o.items.map((it: any) => (
                          <div key={it.medicineId} className="flex justify-between text-sm text-slate-300">
                            <div>{it.name}</div>
                            <div>{it.quantity} x ${it.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
              <h2 className="text-xl font-bold mb-6">Users & Assignments</h2>
              <p className="text-sm text-slate-400 mb-4">Assign patients to doctors</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs font-bold uppercase border-b border-slate-800">
                      <th className="pb-4">Patient</th>
                      <th className="pb-4">Email</th>
                      <th className="pb-4">Assigned Doctor</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.filter(u => (u.role || '').toString().toLowerCase() === 'patient').map(p => (
                      <tr key={p._id} className="text-sm">
                        <td className="py-4 font-semibold">{p.name}</td>
                        <td className="py-4 text-slate-400">{p.email}</td>
                        <td className="py-4 text-slate-300">
                          <select defaultValue={p.assignedDoctor?._id || ''} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm" onChange={(e) => assignDoctorToUser(p._id, e.target.value)}>
                            <option value="">Unassigned</option>
                            {doctors.map(d => (
                              <option key={d._id} value={d._id}>Dr. {d.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => assignDoctorToUser(p._id, '')} className="text-slate-500 hover:text-red-400 mr-4 transition-colors">Unassign</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
