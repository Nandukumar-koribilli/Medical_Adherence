
import React, { useState, useEffect } from 'react';
import { User, Medication, AdherenceLog, UserRole } from '../types';
import { api } from '../services/api';
import { generatePatientSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'messages' | 'analytics'>('patients');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [patients, setPatients] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Conversation state for messages tab
  const [conversation, setConversation] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const openConversation = async (patient: any) => {
    setSelectedPatient(patient);
    setConvLoading(true);
    try {
      const res = await api.getThread(patient.id || patient._id);
      setConversation(res.data);
      // Mark messages from this patient as read (doctor view)
      try {
        await api.markMessagesRead(patient.id || patient._id);
        setMessages(prev => prev.map(m => {
          const sid = m.senderId && (typeof m.senderId === 'object' ? (m.senderId._id || m.senderId.id) : m.senderId);
          if (sid === (patient.id || patient._id)) return { ...m, read: true };
          return m;
        }));
      } catch (e) {
        console.error('Error marking messages read:', e);
      }
    } catch (err) {
      console.error('Error loading thread:', err);
      setConversation([]);
    }
    setConvLoading(false);
  };

  // Poll for received messages when in the messages tab so doctors see incoming messages and counts
  useEffect(() => {
    let mounted = true;
    let interval: any = null;
    const loadReceived = async () => {
      try {
        const res = await api.getReceivedMessages();
        if (!mounted) return;
        setMessages(res.data || []);
      } catch (e) {
        console.error('Error loading received messages:', e);
      }
    };

    if (activeTab === 'messages') {
      loadReceived();
      interval = setInterval(loadReceived, 5000);
    }

    return () => { mounted = false; if (interval) clearInterval(interval); };
  }, [activeTab]);

  const sendMessageToPatient = async () => {
    if (!newMessage.trim() || !selectedPatient) return;
    try {
      const payload = { receiverId: selectedPatient.id || selectedPatient._id, content: newMessage };
      const res = await api.sendMessage(payload);
      const created = res.data;
      const me = JSON.parse(localStorage.getItem('medsmart_user') || '{}');
      const msgToPush = {
        ...created,
        content: created.content || created.message || created.text,
        senderId: { id: me?.id || me?._id, name: me?.name, avatar: me?.avatar }
      };
      setConversation(prev => [...prev, msgToPush]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, messagesRes] = await Promise.all([
        api.getAllUsers(),
        api.getReceivedMessages()
      ]);
      // Filter only patients
      // Filter patients; if the logged-in user is a doctor, only show patients assigned to them
      const allPatients = usersRes.data.filter((u: any) => (u.role || '').toString().toLowerCase() === 'patient').map((u: any) => ({
        ...u,
        adherence: Math.floor(Math.random() * 40) + 60, // Mock adherence until backend supports it
        lastActive: 'Today',
        risk: Math.random() > 0.7 ? 'high' : 'low' // Mock risk
      }));

      const filtered = user?.role === 'doctor'
        ? allPatients.filter((p: any) => {
            const assigned = p.assignedDoctor;
            const assignedId = assigned && (assigned._id || assigned.id || assigned);
            const myId = user?.id || user?._id;
            return assignedId && assignedId.toString() === myId?.toString();
          })
        : allPatients;

      setPatients(filtered);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const handlePatientSelect = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingAi(true);
    // Simulated medication/logs for analysis
    const result = await generatePatientSummary(
      patient.name,
      [{ id: '1', name: 'Heart Pill', dosage: '50mg', frequency: 'Daily', duration: 'Ongoing' }],
      [{ id: '1', patientId: patient.id, medicationId: '1', status: patient.adherence < 50 ? 'missed' : 'taken', timestamp: new Date().toISOString() }]
    );
    setAiInsight(result);
    setLoadingAi(false);
  };

  const COLORS = ['#ef4444', '#f97316', '#3b82f6'];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <i className="fas fa-user-md text-white"></i>
            </div>
            <span className="font-bold text-lg tracking-tight">Doctor Portal</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-users"></i> Patients
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-chart-line"></i> Analytics
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-envelope"></i> Messages
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md">
          <h2 className="text-2xl font-bold">Health Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">Welcome, Dr. {user.name}</span>
            <img src={user.avatar} className="w-8 h-8 rounded-full" />
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-bold mb-4">Assigned Patients</h3>
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePatientSelect(p)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedPatient?.id === p.id ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold">{p.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.risk === 'high' ? 'bg-red-500/20 text-red-500' : p.risk === 'medium' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                        {p.risk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Adherence: <span className={p.adherence < 50 ? 'text-red-400' : 'text-blue-400'}>{p.adherence}%</span></span>
                      <span>• {p.lastActive}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{selectedPatient.name} - Detailed View</h3>
                        <button className="text-blue-400 hover:underline text-sm font-semibold">Update Prescription</button>
                      </div>

                      {loadingAi ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-4 text-slate-400">AI is analyzing adherence patterns...</p>
                        </div>
                      ) : aiInsight && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-900/10 border border-blue-900/20 rounded-xl">
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">AI Summary</h4>
                            <p className="text-slate-300 leading-relaxed text-sm">{aiInsight.summary}</p>
                          </div>
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2">Doctor Checklist</h4>
                            <ul className="space-y-2">
                              {aiInsight.recommendations.map((r: string, idx: number) => (
                                <li key={idx} className="flex gap-2 text-xs text-slate-400">
                                  <i className="fas fa-check-circle text-blue-500 mt-0.5"></i> {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <h3 className="text-lg font-bold mb-4">Adherence vs Targets</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Current', val: selectedPatient.adherence },
                            { name: 'Target', val: 95 },
                            { name: 'Average', val: 75 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                              {[0, 1, 2].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? (selectedPatient.adherence < 60 ? '#ef4444' : '#3b82f6') : '#1e293b'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-dashed border-slate-800 h-96 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                    <i className="fas fa-user-circle text-5xl mb-4 opacity-20"></i>
                    <p>Select a patient to view analytics and AI insights</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Risk Distribution</h3>
                <div className="h-64 flex items-end justify-around pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-red-500/80 rounded-t-lg h-32"></div>
                    <span className="text-xs mt-2 text-slate-400">High Risk (12)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-orange-500/80 rounded-t-lg h-48"></div>
                    <span className="text-xs mt-2 text-slate-400">Medium Risk (28)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-blue-500/80 rounded-t-lg h-56"></div>
                    <span className="text-xs mt-2 text-slate-400">Low Risk (85)</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Critical Alerts</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-red-900/10 border border-red-900/30 rounded-xl flex gap-3">
                      <i className="fas fa-exclamation-triangle text-red-500"></i>
                      <div>
                        <p className="text-sm font-bold text-red-400">Missed Doses Alert</p>
                        <p className="text-xs text-slate-500">Emily Brown missed 3 consecutive evening doses.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex h-[600px] overflow-hidden">
              <div className="w-72 border-r border-slate-800 overflow-y-auto">
                {patients.map(p => {
                  const pid = p.id || p._id;
                  const unread = messages.filter(m => {
                    const sid = m.senderId && (typeof m.senderId === 'object' ? (m.senderId._id || m.senderId.id) : m.senderId);
                    return sid === pid && !m.read;
                  }).length;
                  const lastMsg = messages.find(m => {
                    const sid = m.senderId && (typeof m.senderId === 'object' ? (m.senderId._id || m.senderId.id) : m.senderId);
                    const rid = m.receiverId && (typeof m.receiverId === 'object' ? (m.receiverId._id || m.receiverId.id) : m.receiverId);
                    return sid === pid || rid === pid;
                  });

                  return (
                    <button key={pid} onClick={() => openConversation(p)} className={`w-full p-4 border-b border-slate-800 hover:bg-slate-800 flex items-center gap-3 text-left ${selectedPatient?.id === pid ? 'bg-slate-800' : ''}`}>
                      <img src={`https://picsum.photos/seed/${pid}/200`} className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{p.name}</p>
                          {unread > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{unread}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate w-40">{lastMsg ? (lastMsg.content || lastMsg.message || lastMsg.text) : 'No messages yet'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  {selectedPatient ? (
                    <>
                      <img src={`https://picsum.photos/seed/${selectedPatient.id}/200`} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold">{selectedPatient.name}</p>
                        <p className="text-xs text-slate-400">Conversation</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400">Select a conversation to reply</div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {convLoading && <p className="text-center text-slate-500">Loading conversation...</p>}
                  {!selectedPatient && !convLoading && <div className="flex-1 flex flex-col justify-center items-center text-slate-600"><i className="far fa-comments text-5xl mb-4"></i><p>Select a conversation to reply</p></div>}

                  {conversation.map((m: any, i: number) => {
                    const senderId = m.senderId && (typeof m.senderId === 'object' ? (m.senderId.id || m.senderId._id) : m.senderId);
                    const currentUser = JSON.parse(localStorage.getItem('medsmart_user') || '{}');
                    const loggedUserId = currentUser.id || currentUser._id;
                    const isSenderLoggedUser = senderId === loggedUserId;
                    const loggedIsDoctor = user?.role === 'doctor';
                    // When a doctor is viewing, we want doctor messages on the LEFT and patient messages on the RIGHT.
                    const isMessageOnRight = loggedIsDoctor ? !isSenderLoggedUser : isSenderLoggedUser;

                    return (
                      <div key={i} className={`flex ${isMessageOnRight ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl ${isSenderLoggedUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'}`}>
                          <p className="text-sm">{m.content || m.message || m.text}</p>
                          <p className={`text-[10px] opacity-50 mt-1 ${isMessageOnRight ? 'text-right' : 'text-left'}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
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
                    onKeyDown={(e) => e.key === 'Enter' && sendMessageToPatient()}
                    placeholder={selectedPatient ? `Message ${selectedPatient.name}...` : 'Select a patient to message'}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none"
                    disabled={!selectedPatient}
                  />
                  <button
                    onClick={sendMessageToPatient}
                    disabled={!selectedPatient}
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

export default DoctorDashboard;
