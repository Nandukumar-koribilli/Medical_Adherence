
import React, { useState, useEffect } from 'react';
import { User, Medication, AdherenceLog } from '../types';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meds' | 'store' | 'orders' | 'messages'>('overview');
  const [myMeds, setMyMeds] = useState<Medication[]>([]);
  const [myReminders, setMyReminders] = useState<any[]>([]);
  const [reminderOpenFor, setReminderOpenFor] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [creatingReminder, setCreatingReminder] = useState(false);
  const [newReminderMedName, setNewReminderMedName] = useState<string>('');
  const [newReminderRecurrenceType, setNewReminderRecurrenceType] = useState<'weekly'|'daily'|'everyX'|'one-off'>('weekly');
  const [newReminderDays, setNewReminderDays] = useState<string[]>([]);
  const [newReminderEveryX, setNewReminderEveryX] = useState<number>(2);
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderScheduledAt, setNewReminderScheduledAt] = useState('');
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecurrenceType, setEditRecurrenceType] = useState<'weekly'|'daily'|'everyX'|'one-off'>('weekly');
  const [editTime, setEditTime] = useState('');
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editEveryX, setEditEveryX] = useState<number>(2);
  const [editMessage, setEditMessage] = useState('');
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [storeMeds, setStoreMeds] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<AdherenceLog[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Cart state for store/orders
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Orders (patient)
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Toast for instant notification popup
  const [toast, setToast] = useState<{ visible: boolean; title?: string; message?: string }>({ visible: false });
  const [lastNotifId, setLastNotifId] = useState<string | null>(null);

  const loadMyOrders = async () => {
    setLoadingMyOrders(true);
    try {
      const res = await api.getMyOrders();
      setMyOrders(res.data);
    } catch (err) {
      console.error('Error loading my orders:', err);
    }
    setLoadingMyOrders(false);
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getMyNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
      return res.data;
    } catch (err) {
      console.error('Error loading notifications:', err);
      return [];
    }
  };

  const markNotification = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async (notes: any[]) => {
    const unread = notes.filter((n: any) => !n.read);
    await Promise.all(unread.map(n => api.markNotificationRead(n._id).catch(e => console.error(e))));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Load my orders, reminders and notifications when user opens Orders or Meds tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadMyOrders();
      (async () => {
        const notes = await loadNotifications();
        if (notes && notes.length) await markAllNotificationsRead(notes);
      })();
    }

    if (activeTab === 'meds') {
      (async () => {
        try {
          const res = await api.getMyReminders();
          setMyReminders(res.data);
        } catch (e) {
          console.error('Error loading reminders', e);
        }
      })();
    }
  }, [activeTab]);

  // Poll notifications periodically to show toast for new notifications
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const notes = await loadNotifications();
        if (!mounted || !notes || notes.length === 0) return;
        const newest = notes[0];
        if (newest && newest._id !== lastNotifId && !newest.read) {
          // show toast
          setToast({ visible: true, title: newest.title, message: newest.message });
          setTimeout(() => setToast({ visible: false }), 4000);
          setLastNotifId(newest._id);
        }
      } catch (e) {
        // ignore
      }
    };

    // initial load
    check();
    const interval = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [lastNotifId]);

  useEffect(() => {
    // When user enters messages tab, load available doctors
    if (activeTab === 'messages') {
      loadDoctors();
    }
  }, [activeTab]);

  const loadDoctors = async () => {
    try {
      const usersRes = await api.getAllUsers();
      const docs = usersRes.data.filter((u: any) => (u.role || '').toString().toLowerCase() === 'doctor');
      setDoctors(docs);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const selectDoctor = async (doc: any) => {
    setSelectedDoctor(doc);
    setConvLoading(true);
    try {
      const threadRes = await api.getThread(doc.id || doc._id);
      setConversation(threadRes.data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConversation([]);
    }
    setConvLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctor) return;
    try {
      const payload = {
        receiverId: selectedDoctor.id || selectedDoctor._id,
        content: newMessage
      };
      const res = await api.sendMessage(payload);
      // Append locally for instant UX (server returns created message)
      const created = res.data;
      // Enrich created message with sender info for rendering
      const me = JSON.parse(localStorage.getItem('medsmart_user') || '{}');
      const msgToPush = {
        ...created,
        content: created.content || created.message || created.text,
        senderId: { id: me?.id || me?._id, name: me?.name, avatar: me?.avatar }
      };
      setConversation(prev => [...prev, msgToPush]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      // mark app opened for streak counting
      try {
        await api.markAppOpened(user.id || user._id);
      } catch (err) {
        console.error('Error marking app opened', err);
      }

      await fetchData();
    };
    init();
  }, []);

  // Compute next occurrence for a reminder on the client (supports one-off and recurring types)
  const computeNextOccurrence = (rem: any, fromDate = new Date()) => {
    if (!rem) return null;
    if (!rem.isRecurring) {
      if (rem.scheduledAt && new Date(rem.scheduledAt) >= fromDate && !rem.sent) return new Date(rem.scheduledAt);
      return null;
    }

    const timeStr = rem.time || '00:00';
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10) || 0;
    const minute = parseInt(minuteStr, 10) || 0;

    const nameToNum: any = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    if (rem.recurrenceType === 'daily') {
      for (let i = 0; i < 365; i++) {
        const cand = new Date(fromDate);
        cand.setDate(fromDate.getDate() + i);
        cand.setHours(hour, minute, 0, 0);
        if (cand >= fromDate) return cand;
      }
      return null;
    }

    if (rem.recurrenceType === 'everyX' && rem.everyXDays && rem.everyXDays > 0) {
      const anchor = rem.lastRun ? new Date(rem.lastRun) : (rem.createdAt ? new Date(rem.createdAt) : new Date());
      let candidate = new Date(anchor);
      candidate.setHours(hour, minute, 0, 0);
      while (candidate <= fromDate) {
        candidate.setDate(candidate.getDate() + rem.everyXDays);
      }
      return candidate;
    }

    // weekly behavior
    const days = rem.daysOfWeek || [];
    const daysNums = days.map((d: string) => nameToNum[d]).filter((n: any) => typeof n === 'number');
    if (daysNums.length === 0) return null;
    for (let i = 0; i < 14; i++) {
      const candidate = new Date(fromDate);
      candidate.setDate(fromDate.getDate() + i);
      candidate.setHours(hour, minute, 0, 0);
      if (candidate >= fromDate && daysNums.includes(candidate.getDay())) return candidate;
    }
    return null;
  };

  const fetchData = async () => {
    try {
      const [medsRes, storeRes, logsRes, remindersRes] = await Promise.all([
        api.getUserMedicines(),
        api.getMedicineStore(),
        api.getUserLogs(),
        api.getMyReminders()
      ]);
      setMyMeds(medsRes.data);
      setStoreMeds(storeRes.data);
      setLogs(logsRes.data);
      setMyReminders(remindersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Compute nearest upcoming reminder (one-off or recurring)
  const nextUpcoming = (() => {
    if (!myReminders || myReminders.length === 0) return null;
    const now = new Date();
    const mapped = myReminders.map((r: any) => ({ r, next: computeNextOccurrence(r, now) })).filter((x: any) => x.next);
    if (mapped.length === 0) return null;
    mapped.sort((a: any, b: any) => new Date(a.next).getTime() - new Date(b.next).getTime());
    return mapped[0];
  })();

  // Mock adherence data for chart (backend doesn't provide this aggregate yet)
  const data = [
    { day: 'Mon', adherence: 100 },
    // ... rest of mock data can stay for visual demo until backend supports stats
  ];


  const handleTakeMed = async (medId: string) => {
    try {
      await api.logAdherence({
        medicineId: medId,
        status: 'taken',
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        dosage: '1 tablet' // Should come from medication details ideally
      });
      alert('Medication taken!');
      fetchData(); // Refresh logs
    } catch (error) {
      console.error('Error logging adherence:', error);
    }
  };

  const addToCart = (med: Medication) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicineId === med.id);
      if (existing) {
        return prev.map(item => item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { medicineId: med.id, name: med.name, price: med.price || 0, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (medicineId: string, qty: number) => {
    setCart(prev => prev.map(i => i.medicineId === medicineId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(i => i.medicineId !== medicineId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const res = await api.createOrder({ items: cart });
      alert('Order placed — waiting admin approval');
      setCart([]);
      setCartOpen(false);
      loadMyOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
    setPlacingOrder(false);
  };



  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <i className="fas fa-heartbeat text-white"></i>
            </div>
            <span className="font-bold text-lg tracking-tight">MedSmart AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-th-large"></i> Overview
          </button>
          <button
            onClick={() => setActiveTab('meds')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'meds' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-pills"></i> My Meds
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'store' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-shopping-cart"></i> Medication Store
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-comment-medical"></i> Doctor Chat
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-700" alt="Avatar" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('orders')} className="relative p-2 text-slate-400 hover:text-blue-400 transition-colors">
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-orange-600/30 transition-all">
              SOS EMERGENCY
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Cart drawer */}
          <div className={`fixed right-6 top-24 w-full sm:w-96 max-w-[24rem] bg-slate-900 border border-slate-800 rounded-2xl p-4 z-50 transition-all ${cartOpen ? 'block' : 'hidden'}`}>
            <h4 className="font-bold mb-4">Your Cart</h4>
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm">Your cart is empty.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map(i => (
                  <div key={i.medicineId} className="flex items-center justify-between p-2 border border-slate-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm">{i.name}</p>
                      <p className="text-xs text-slate-400">${i.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={i.quantity} min={1} onChange={(e) => updateCartQty(i.medicineId, Number(e.target.value))} className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm" />
                      <button onClick={() => removeFromCart(i.medicineId)} className="text-xs text-red-400">Remove</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">Total:</div>
                  <div className="font-bold">${cart.reduce((s, c) => s + c.price * c.quantity, 0).toFixed(2)}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setCartOpen(false)} className="flex-1 py-2 rounded-xl border border-slate-700">Continue Shopping</button>
                  <button onClick={placeOrder} disabled={placingOrder} className="flex-1 py-2 rounded-xl bg-blue-600 text-white">{placingOrder ? 'Placing...' : 'Place Order'}</button>
                </div>
              </div>
            )}
          </div>

          {/* Toast popup */}
          {toast.visible && (
            <div className="fixed top-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 w-80">
              <p className="font-bold">{toast.title}</p>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-slate-400 text-sm mb-1">Weekly Adherence</p>
                  <p className="text-3xl font-bold text-blue-400">92%</p>
                  <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-slate-400 text-sm mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-500">{(user as any).openDaysCount || 0} Days</p>
                  <p className="text-xs text-slate-500 mt-2">Personal Best: 24 Days</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-slate-400 text-sm mb-1">Next Dose</p>
                  {nextUpcoming ? (
                    <>
                      <p className="text-3xl font-bold text-white">{new Date(nextUpcoming.next).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-blue-400 mt-2 font-medium">{nextUpcoming.r.medicineName}{nextUpcoming.r.medicineId ? ` • ${ (myMeds.find(m => (m.id || m._id) === nextUpcoming.r.medicineId)?.dosage) || ''}` : ''}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-white">—</p>
                      <p className="text-xs text-blue-400 mt-2 font-medium">No upcoming dose</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-6">Adherence Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="adherence" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAdh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>

                  {nextUpcoming ? (
                    <div className="p-3 mb-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-400">Next</p>
                      <p className="font-semibold">{nextUpcoming.r.medicineName}</p>
                      <p className="text-xs text-slate-400">{new Date(nextUpcoming.next).toLocaleString()}</p>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {myMeds.length > 0 ? myMeds.map(med => (
                      <div key={med.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div>
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-sm text-slate-400">{med.dosage} • {med.frequency}</p>
                        </div>
                        <button
                          onClick={() => handleTakeMed(med.id)}
                          className="bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          Confirm Intake
                        </button>
                      </div>
                    )) : (
                      <p className="text-slate-500 text-center py-8">No medications added. Check the store!</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Doctor's Recommendations</h3>
                  <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                    <div className="flex gap-3">
                      <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                      <p className="text-slate-300 text-sm">
                        "Your blood pressure shows a slight upward trend. Please ensure you take your morning Lisinopril exactly on time. Avoid heavy sodium intake for the next 48 hours."
                        <br /><span className="text-blue-400 text-xs font-bold block mt-2">— Dr. Smith (Cardiology)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meds' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myMeds.map(med => (
                <div key={med.id} className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden break-words">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl">
                      <i className="fas fa-pills text-blue-400 text-xl"></i>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-500 rounded uppercase tracking-wider">Active</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{med.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{med.dosage}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <i className="fas fa-clock text-slate-500 w-4"></i> {med.frequency}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <i className="fas fa-calendar-alt text-slate-500 w-4"></i> {med.duration}
                    </div>

                    {/* Reminders for this medication */}
                    <div className="text-xs text-slate-400 mt-2">
                      {myReminders.filter(r => (r.medicineId === med.id || r.medicineId === med._id)).length === 0 ? (
                        <div className="text-slate-500">No reminders set</div>
                      ) : (
                        myReminders.filter(r => (r.medicineId === med.id || r.medicineId === med._id)).map(r => (
                          <div key={r._id} className={`inline-block mr-2 px-2 py-1 rounded ${r.sent ? 'bg-green-800 text-green-200' : 'bg-slate-800 text-slate-200'}`}>
                            {r.sent ? 'Sent' : `Reminds at ${new Date(r.scheduledAt).toLocaleString()}`}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTakeMed(med.id)}
                      className="bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      Confirm Intake
                    </button>
                    <button
                      onClick={() => { setReminderOpenFor(med.id); setReminderTime(''); setReminderMessage(`Time to take ${med.name}`); }}
                      className="bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 text-sm"
                    >
                      Set Reminder
                    </button>
                  </div>

                  {/* Inline reminder form */}
                  {reminderOpenFor === med.id && (
                    <div className="mt-4 w-full max-w-xs p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                      <h4 className="font-semibold mb-2">Set Reminder for {med.name}</h4>
                      <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mb-2" />
                      <input type="text" value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          if (!reminderTime) return alert('Pick a date and time');
                          setCreatingReminder(true);
                          try {
                            await api.createReminder({ medicineId: med.id || med._id, medicineName: med.name, scheduledAt: new Date(reminderTime), message: reminderMessage });
                            setReminderOpenFor(null);
                            const res = await api.getMyReminders();
                            setMyReminders(res.data);
                            alert('Reminder scheduled');
                          } catch (err) {
                            console.error('Error creating reminder', err);
                            alert('Failed to schedule reminder');
                          }
                          setCreatingReminder(false);
                        }} className="flex-1 py-2 bg-blue-600 rounded">{creatingReminder ? 'Scheduling...' : 'Schedule'}</button>
                        <button onClick={() => setReminderOpenFor(null)} className="flex-1 py-2 border rounded">Cancel</button>
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all">
                    View Details
                  </button>
                </div>
              ))}

              {/* Reminders table */}
              <div className="col-span-full bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-lg font-bold mb-3">Reminders</h3>

                <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3">
                  <input type="text" value={newReminderMedName} onChange={(e) => setNewReminderMedName(e.target.value)} placeholder="Medication name" className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-48 min-w-0" />

                  <select value={newReminderRecurrenceType} onChange={(e) => setNewReminderRecurrenceType(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-44">
                    <option value="weekly">Weekly (choose days)</option>
                    <option value="daily">Every day</option>
                    <option value="everyX">Every X days</option>
                    <option value="one-off">One-off (exact date)</option>
                  </select>

                  {newReminderRecurrenceType === 'weekly' && (
                    <div className="flex gap-1 items-center flex-wrap max-w-xs overflow-auto">
                      <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-24" />
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <label key={d} className="text-xs flex items-center gap-1 mr-2">
                          <input type="checkbox" checked={newReminderDays.includes(d)} onChange={(e) => {
                            setNewReminderDays(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d));
                          }} />
                          <span className="ml-1">{d}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {newReminderRecurrenceType === 'daily' && (
                    <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-24" />
                  )}

                  {newReminderRecurrenceType === 'everyX' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="number" min={1} value={newReminderEveryX} onChange={(e) => setNewReminderEveryX(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-24" />
                      <span className="text-slate-400">days</span>
                      <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-24" />
                    </div>
                  )}

                  {newReminderRecurrenceType === 'one-off' && (
                    <input type="datetime-local" value={newReminderScheduledAt} onChange={(e) => setNewReminderScheduledAt(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:w-48" />
                  )}

                  <input type="text" placeholder="Reminder message" value={newReminderMessage} onChange={(e) => setNewReminderMessage(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full sm:flex-1 min-w-0" />
                  <button onClick={async () => {
                    // Validate based on recurrence type
                    if (!newReminderMedName) return alert('Enter medication name');
                    if (newReminderRecurrenceType === 'weekly' && (!newReminderTime || newReminderDays.length === 0)) return alert('Pick time and select days');
                    if (newReminderRecurrenceType === 'daily' && !newReminderTime) return alert('Pick time');
                    if (newReminderRecurrenceType === 'everyX' && (!newReminderTime || !newReminderEveryX || newReminderEveryX < 1)) return alert('Set interval and time');
                    if (newReminderRecurrenceType === 'one-off' && !newReminderScheduledAt) return alert('Pick exact date & time');

                    setCreatingReminder(true);
                    try {
                      if (newReminderRecurrenceType === 'one-off') {
                        await api.createReminder({ medicineName: newReminderMedName, scheduledAt: new Date(newReminderScheduledAt), message: newReminderMessage || `Time to take ${newReminderMedName}` });
                      } else if (newReminderRecurrenceType === 'weekly') {
                        await api.createReminder({ medicineName: newReminderMedName, isRecurring: true, recurrenceType: 'weekly', daysOfWeek: newReminderDays, time: newReminderTime, message: newReminderMessage || `Time to take ${newReminderMedName}` });
                      } else if (newReminderRecurrenceType === 'daily') {
                        await api.createReminder({ medicineName: newReminderMedName, isRecurring: true, recurrenceType: 'daily', time: newReminderTime, message: newReminderMessage || `Time to take ${newReminderMedName}` });
                      } else if (newReminderRecurrenceType === 'everyX') {
                        await api.createReminder({ medicineName: newReminderMedName, isRecurring: true, recurrenceType: 'everyX', everyXDays: newReminderEveryX, time: newReminderTime, message: newReminderMessage || `Time to take ${newReminderMedName}` });
                      }

                      const res = await api.getMyReminders();
                      setMyReminders(res.data);
                      // reset inputs
                      setNewReminderMedName(''); setNewReminderTime(''); setNewReminderMessage(''); setNewReminderDays([]); setNewReminderEveryX(2); setNewReminderScheduledAt('');
                      alert('Reminder scheduled');
                    } catch (err) {
                      console.error('Error creating reminder', err);
                      alert('Failed to schedule reminder');
                    }
                    setCreatingReminder(false);
                  }} className="bg-blue-600 text-white px-3 py-2 rounded w-full sm:w-auto">{creatingReminder ? 'Scheduling...' : 'Schedule'}</button>
                </div>

                <div className="max-h-56 overflow-y-auto overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs">
                        <th className="py-2">Medicine</th>
                        <th className="py-2">Scheduled</th>
                        <th className="py-2">Message</th>
                        <th className="py-2">Sent</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReminders.length === 0 ? (
                        <tr><td colSpan={5} className="text-slate-500 py-4">No reminders yet</td></tr>
                      ) : myReminders.map(r => (
                        <tr key={r._id} className="border-t border-slate-800">
                          <td className="py-2 max-w-[140px] break-words">{r.medicineName}</td>
                          <td className="py-2 max-w-[220px] break-words">
                            {editingId === r._id ? (
                              r.isRecurring ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <select value={editRecurrenceType} onChange={(e) => setEditRecurrenceType(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full sm:w-auto">
                                    <option value="weekly">Weekly</option>
                                    <option value="daily">Every day</option>
                                    <option value="everyX">Every X days</option>
                                  </select>

                                  {editRecurrenceType === 'weekly' && (
                                    <div className="flex gap-1 items-center flex-wrap max-w-xs overflow-auto">
                                      <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full sm:w-24" />
                                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                                        <label key={d} className="text-xs flex items-center gap-1 mr-2">
                                          <input type="checkbox" checked={editDays.includes(d)} onChange={(e) => setEditDays(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d))} />
                                          <span className="ml-1">{d}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}

                                  {editRecurrenceType === 'daily' && (
                                    <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full sm:w-24" />
                                  )}

                                  {editRecurrenceType === 'everyX' && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <input type="number" min={1} value={editEveryX} onChange={(e) => setEditEveryX(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-24" />
                                      <span className="text-slate-400">days</span>
                                      <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-full sm:w-24" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <input type="datetime-local" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full" />
                              )
                            ) : (
                              r.isRecurring ? (r.recurrenceType === 'daily' ? `Every day @ ${r.time}` : (r.recurrenceType === 'everyX' ? `Every ${r.everyXDays} days @ ${r.time}` : `${(r.daysOfWeek || []).join(', ')} @ ${r.time || ''}`)) : (r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : '')
                            )}
                          </td>
                          <td className="py-2 max-w-[300px] break-words">
                            {editingId === r._id ? (
                              <input value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full" />
                            ) : (
                              <div className="whitespace-normal break-words">{r.message}</div>
                            )}
                          </td>
                          <td className="py-2">{r.isRecurring ? (r.lastRun ? new Date(r.lastRun).toLocaleString() : 'No') : (r.sent ? 'Yes' : 'No')}</td>
                          <td className="py-2 space-x-2">
                            {editingId === r._id ? (
                              <>
                                <button onClick={async () => {
                                  try {
                                    if (r.isRecurring) {
                                      if (editRecurrenceType === 'weekly') {
                                        await api.updateReminder(r._id, { isRecurring: true, recurrenceType: 'weekly', time: editTime, daysOfWeek: editDays, message: editMessage });
                                      } else if (editRecurrenceType === 'daily') {
                                        await api.updateReminder(r._id, { isRecurring: true, recurrenceType: 'daily', time: editTime, message: editMessage });
                                      } else if (editRecurrenceType === 'everyX') {
                                        await api.updateReminder(r._id, { isRecurring: true, recurrenceType: 'everyX', everyXDays: editEveryX, time: editTime, message: editMessage });
                                      }
                                    } else {
                                      await api.updateReminder(r._id, { scheduledAt: new Date(editTime), message: editMessage });
                                    }
                                    const res = await api.getMyReminders();
                                    setMyReminders(res.data);
                                    setEditingId(null);
                                  } catch (err) {
                                    console.error('Failed to update reminder', err);
                                    alert('Failed to update');
                                  }
                                }} className="bg-green-600 px-2 py-1 rounded text-white">Save</button>
                                <button onClick={() => setEditingId(null)} className="border px-2 py-1 rounded">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => {
                                  setEditingId(r._id);
                                  setEditRecurrenceType(r.recurrenceType || (r.isRecurring ? 'weekly' : 'one-off'));
                                  setEditTime(r.isRecurring ? (r.time || '') : (r.scheduledAt ? new Date(r.scheduledAt).toISOString().slice(0,16) : ''));
                                  setEditDays(r.daysOfWeek || []);
                                  setEditEveryX(r.everyXDays || 2);
                                  setEditMessage(r.message || '');
                                }} className="bg-yellow-600 px-2 py-1 rounded">Edit</button>
                                <button onClick={async () => {
                                  if (!confirm('Cancel this reminder?')) return;
                                  try {
                                    await api.cancelReminder(r._id);
                                    const res = await api.getMyReminders();
                                    setMyReminders(res.data);
                                  } catch (err) {
                                    console.error('Failed to cancel reminder', err);
                                    alert('Failed to cancel');
                                  }
                                }} className="bg-red-600 px-2 py-1 rounded text-white">Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('store')}
                className="bg-slate-900/50 border border-dashed border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400 hover:border-blue-400/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center group-hover:border-blue-400/50">
                  <i className="fas fa-plus"></i>
                </div>
                <span>Browse Store</span>
              </button>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search medication store..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Categories</option>
                  <option>Antibiotics</option>
                  <option>Heart Health</option>
                  <option>Diabetes</option>
                </select>
                <button onClick={() => setCartOpen(true)} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-xl">View Cart ({cart.length})</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {storeMeds.map(med => (
                  <div key={med.id} className="bg-slate-900 border border-slate-800 overflow-hidden rounded-2xl flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{med.name}</h3>
                        <span className="text-blue-400 font-bold">${med.price}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{med.description}</p>
                      <div className="space-y-1 text-xs text-slate-500">
                        <p>Dosage: {med.dosage}</p>
                        <p>Schedule: {med.frequency}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                      <button
                        onClick={() => addToCart(med)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4">Your Orders & Notifications</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold mb-3">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm">No notifications.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n._id} onClick={() => !n.read && markNotification(n._id)} className={`p-3 rounded-md cursor-pointer ${n.read ? 'bg-slate-900' : 'bg-slate-800 border border-slate-700'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">{n.title}</p>
                              <p className="text-xs text-slate-400">{n.message}</p>
                            </div>
                            <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold mb-3">Orders</h4>
                  {loadingMyOrders ? (
                    <p className="text-slate-500">Loading your orders...</p>
                  ) : myOrders.length === 0 ? (
                    <p className="text-slate-500">You have no orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map(o => (
                        <div key={o._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Order #{o._id}</p>
                              <p className="text-xs text-slate-400">Placed {new Date(o.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold mb-2">{o.status}</div>
                              {o.status === 'accepted' && (
                                <div className="text-xs text-green-400">Arrives in {Math.max(0, Math.ceil(((new Date(o.deliveryDate)).getTime() - Date.now()) / (1000*60*60*24)))} days</div>
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
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[calc(100vh-200px)] flex overflow-hidden">
              {/* Doctors list */}
              <div className="w-1/3 border-r border-slate-800 p-4 overflow-y-auto">
                <h4 className="font-bold mb-3">Select a Doctor</h4>
                {doctors.length === 0 ? (
                  <p className="text-slate-500 text-sm">No doctors available right now.</p>
                ) : (
                  <div className="space-y-2">
                    {doctors.map((d: any) => (
                      <button
                        key={d.id || d._id}
                        onClick={() => selectDoctor(d)}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${selectedDoctor && (selectedDoctor.id === (d.id || d._id) || selectedDoctor._id === (d.id || d._id)) ? 'bg-blue-700 text-white' : 'hover:bg-slate-800'}`}
                      >
                        <img src={d.avatar || 'https://picsum.photos/seed/doc/80'} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-xs text-slate-400 truncate">{d.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat panel */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  {selectedDoctor ? (
                    <>
                      <img src={selectedDoctor.avatar || 'https://picsum.photos/seed/doc/200'} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold">{selectedDoctor.name}</p>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400">Select a doctor to start chatting</div>
                  )}


                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {convLoading && <p className="text-center text-slate-500">Loading conversation...</p>}
                  {!selectedDoctor && !convLoading && <p className="text-center text-slate-600 mt-10">Please select a doctor from the left to start a conversation.</p>}

                  {conversation.map((m: any, i: number) => {
                    const senderId = m.senderId && (typeof m.senderId === 'object' ? (m.senderId.id || m.senderId._id) : m.senderId);
                    const isMe = senderId === (JSON.parse(localStorage.getItem('medsmart_user') || '{}').id);
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'}`}>
                          <p className="text-sm">{m.content || m.message || m.text}</p>
                          <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={selectedDoctor ? `Message ${selectedDoctor.name}...` : 'Select a doctor to message'}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none"
                    disabled={!selectedDoctor}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!selectedDoctor}
                    className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
