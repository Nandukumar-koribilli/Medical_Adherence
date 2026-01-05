import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '💊',
      title: 'Medicine Reminders',
      description: 'Smart reminders for timely medicine intake'
    },
    {
      icon: '📊',
      title: 'Adherence Tracking',
      description: 'Track your medicine adherence with detailed statistics'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Consultation',
      description: 'Direct messaging with your assigned doctor'
    },
    {
      icon: '⚙️',
      title: 'Admin Control',
      description: 'Manage medicines and doctor-patient assignments'
    },
    {
      icon: '📱',
      title: 'Multi-Platform',
      description: 'Access on web and mobile devices'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and secure'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">🏥 MediCare</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">AI-Powered Smart Drug Adherence Platform</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Improve medicine adherence, enable remote patient monitoring, and provide intelligent 
            insights to doctors and caregivers. Built using the MERN Stack.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">🌟 Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">🧱 Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Frontend</h3>
              <p className="text-gray-600">React.js + Tailwind CSS</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Backend</h3>
              <p className="text-gray-600">Node.js + Express.js</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Database</h3>
              <p className="text-gray-600">MongoDB Atlas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-2">Mobile</h3>
              <p className="text-gray-600">React Native (Expo)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Health?</h2>
          <p className="text-lg mb-8">Join thousands of users who are managing their medications better</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 MediCare - Smart Drug Adherence Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
