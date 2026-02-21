// App.js - Fixed version

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import ProfileSetup from './ProfileSetup';
import Dashboard from './Dashboard'; // Your existing App.js renamed to Dashboard.js

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Check if user has completed profile setup
        const storedUser = localStorage.getItem('user');
        
        // FIX: Safe check for storedUser
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setSetupData(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleNavigateToSetup = (googleUserData) => {
    setSetupData(googleUserData);
  };

  const handleSetupComplete = (userData) => {
    setUser(userData);
    setSetupData(null);
  };

  const handleSetupCancel = () => {
    setSetupData(null);
    signOut(auth);
  };

  // Show loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '6px solid rgba(255,255,255,0.2)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show profile setup if needed
  if (setupData) {
    return (
      <ProfileSetup
        googleUser={setupData}
        onComplete={handleSetupComplete}
        onCancel={handleSetupCancel}
      />
    );
  }

  // Show Login if not authenticated
  if (!user) {
    return <Login 
      onLoginSuccess={setUser} 
      onNavigateToSetup={handleNavigateToSetup}
    />;
  }

  // Show Dashboard if authenticated
  return (
    <div>
      {/* Better Logout Button Position - Top Right Header */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'rgba(255,255,255,0.95)',
        padding: '10px 20px',
        borderRadius: '50px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {user?.full_name && (
            <span style={{
              color: '#1e293b',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Dr. {user.full_name}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
      
      {/* Your existing Dashboard component */}
      <Dashboard user={user} />
    </div>
  );
}

export default App;