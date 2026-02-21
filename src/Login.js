// Login.js — Drop this into retina-frontend/src/Login.js
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase'; 

// ==================== UI COMPONENTS (DESIGN) ====================

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58Z" fill="#EA4335" />
  </svg>
);

const InputField = ({ label, name, type = "text", value, onChange, placeholder, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "hsl(215 28% 17%)", fontFamily: "'Inter', sans-serif" }}>{label}</label>
    <input
      name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid hsl(214 32% 91%)",
        fontSize: 14, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
        color: "hsl(215 28% 10%)", background: "hsl(0 0% 100%)",
        boxSizing: "border-box",
        height: "50px",
        ...style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "hsl(221 83% 53%)";
        e.target.style.boxShadow = "0 0 0 3px hsla(221,83%,53%,0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "hsl(214 32% 91%)";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>
);

const SubmitButton = ({ loading, onClick, children }) => (
  <motion.button
    type="submit" onClick={onClick} disabled={loading}
    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
    style={{
      width: "100%", padding: 14, borderRadius: 10, border: "none",
      background: "linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(217 91% 60%) 100%)",
      fontWeight: 600, color: "white", fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
      boxShadow: "0 4px 14px hsla(221,83%,53%,0.3)", transition: "box-shadow 0.3s",
      opacity: loading ? 0.6 : 1, marginTop: 10,
      boxSizing: "border-box",
      height: "50px"
    }}
  >
    {loading ? (
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{
          width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "white", borderRadius: "50%",
          animation: "spin 0.6s linear infinite", display: "inline-block",
        }} />
        Processing...
      </span>
    ) : children}
  </motion.button>
);

const RetinaScanner = () => {
  const particles = useMemo(
    () => Array.from({ length: 20 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
    })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{ position: "relative", width: 280, height: 280, margin: "60px auto 0" }}
    >
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "hsla(199,89%,48%,0.05)",
        animation: "pulseGlow 2s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%", opacity: 0.5, overflow: "hidden",
        backgroundImage: "linear-gradient(hsla(199,89%,48%,0.08) 1px,transparent 1px),linear-gradient(90deg,hsla(199,89%,48%,0.08) 1px,transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "hsl(199 89% 48%)", boxShadow: "0 0 15px hsl(199 89% 48%)",
        animation: "scanMove 3s ease-in-out infinite", borderRadius: 1,
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 220, height: 220,
        border: "2px dashed hsl(221 83% 53%)", borderRadius: "50%",
        animation: "spinSlow 10s linear infinite",
        transform: "translate(-50%,-50%)",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 140, height: 140,
        borderRadius: "50%", border: "3px solid hsla(199,92%,64%,0.2)",
        borderTopColor: "hsl(199 92% 64%)",
        animation: "spinReverse 4s linear infinite",
        transform: "translate(-50%,-50%)",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 12, height: 12,
        transform: "translate(-50%,-50%)", borderRadius: "50%",
        background: "hsl(199 89% 48%)", boxShadow: "0 0 20px hsl(199 89% 48%)",
      }} />

      {/* ✅ FIXED Corner Markers */}

      {/* Top Left */}
      <div style={{ position: "absolute", top: 4, left: 4, width: 20, height: 20 }}>
        <div style={{ width: "100%", height: 2, background: "hsla(199,89%,48%,0.6)" }} />
        <div style={{ width: 2, height: "100%", background: "hsla(199,89%,48%,0.6)", position: "absolute", top: 0, left: 0 }} />
      </div>

      {/* Top Right */}
      <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20 }}>
        <div style={{ width: "100%", height: 2, background: "hsla(199,89%,48%,0.6)" }} />
        <div style={{ width: 2, height: "100%", background: "hsla(199,89%,48%,0.6)", position: "absolute", top: 0, right: 0 }} />
      </div>

      {/* Bottom Left */}
      <div style={{ position: "absolute", bottom: 4, left: 4, width: 20, height: 20 }}>
        <div style={{ width: "100%", height: 2, background: "hsla(199,89%,48%,0.6)", position: "absolute", bottom: 0 }} />
        <div style={{ width: 2, height: "100%", background: "hsla(199,89%,48%,0.6)", position: "absolute", bottom: 0, left: 0 }} />
      </div>

      {/* Bottom Right */}
      <div style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20 }}>
        <div style={{ width: "100%", height: 2, background: "hsla(199,89%,48%,0.6)", position: "absolute", bottom: 0 }} />
        <div style={{ width: 2, height: "100%", background: "hsla(199,89%,48%,0.6)", position: "absolute", bottom: 0, right: 0 }} />
      </div>

      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: 4, height: 4, borderRadius: "50%",
          background: "hsla(199,89%,48%,0.25)", top: p.top, left: p.left,
          animation: `dataStream ${p.duration} ease-in-out infinite`,
          animationDelay: p.delay,
        }} />
      ))}

      <div style={{
        position: "absolute", bottom: -64, left: "50%", transform: "translateX(-50%)",
        fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
        color: "hsla(199,92%,64%,0.7)", textAlign: "center",
        width: "100%", lineHeight: 1.8,
      }}>
        <p style={{ animation: "dataStream 2s ease-in-out infinite" }}>ANALYZING RETINA...</p>
        <p style={{ animation: "dataStream 2s ease-in-out infinite 0.5s" }}>ACCESS: SECURE</p>
        <p style={{ animation: "dataStream 2s ease-in-out infinite 1s" }}>SYSTEM: ONLINE</p>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const Login = ({ onLoginSuccess }) => {
  // --- REAL LOGIC STATES ---
  const [mode, setMode] = useState('login'); 
  const [signupStep, setSignupStep] = useState(0); 

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', fullName: '', otp: '', newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpBlocked, setOtpBlocked] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (otpAttempts >= 3) {
      setOtpBlocked(true);
      setError('Too many failed attempts. Please request new OTP.');
      setTimeout(() => { setOtpBlocked(false); setOtpAttempts(0); }, 30000);
    }
  }, [otpAttempts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otp') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode); setError(""); setSuccess(""); setSignupStep(0); setOtpSent(false); setFormData({...formData, otp: '', password: '', confirmPassword: ''});
  };

  // --- API HANDLERS ---
  const handleGoogleSignIn = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await fetch('https://dr-project-backend.onrender.com/api/check-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, google_id: user.uid })
      });
      const data = await res.json();
      if (data.exists) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Authentication verified.');
        setTimeout(() => onLoginSuccess(data.user), 1500);
      } else {
        setError('Account not found. Please verify credentials.');
        setFormData(prev => ({ ...prev, email: user.email, fullName: user.displayName || '' }));
        setMode('signup'); setSignupStep(0);
      }
    } catch (err) { setError(err.message || 'Authentication Failed'); } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) { setError('Credentials required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Verified. Accessing Dashboard...');
        setTimeout(() => onLoginSuccess(data.user), 1500);
      } else { setError(data.error || 'Invalid Credentials'); }
    } catch (err) { setError('System Error: Database Unreachable'); } finally { setLoading(false); }
  };

  const handleSignupSendOTP = async () => {
    if (!formData.email) { setError('Email required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/send-signup-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setSignupStep(1); setCountdown(60); setOtpAttempts(0);
        setSuccess(`Code sent to ${formData.email}`);
      } else { setError(data.error || 'Failed to send OTP'); }
    } catch (err) { setError('Network Error'); } finally { setLoading(false); }
  };

  const handleSignupVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) { setError('Invalid Code'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/verify-signup-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      if (res.ok) {
        setSignupStep(2); setSuccess('Confirmed. Complete Profile.'); setOtpAttempts(0);
      } else {
        setOtpAttempts(prev => prev + 1); setError('Invalid Code');
      }
    } catch (err) { setError('Verification Error'); } finally { setLoading(false); }
  };

  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.password) { setError('All fields required'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Password Mismatch'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/complete-signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, full_name: formData.fullName, username: formData.username, password: formData.password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Registered! Redirecting...');
        setTimeout(() => { switchMode('login'); }, 2000);
      } else { setError(data.error || 'Registration Failed'); }
    } catch (err) { setError('Server Error'); } finally { setLoading(false); }
  };

  const handleForgotSendOTP = async () => {
    if (!formData.email) { setError('Email required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) { setOtpSent(true); setCountdown(60); setSuccess('Recovery Code Sent'); }
      else { setError('User not found'); }
    } catch (err) { setError('Network Error'); } finally { setLoading(false); }
  };

  const handleForgotVerifyOTP = async () => {
    if (!formData.otp) { setError('Invalid Code'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      if (res.ok) { setOtpVerified(true); setSuccess('Verified'); }
      else { setError('Invalid Code'); }
    } catch (err) { setError('Verification Failed'); } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) { setError('Password Mismatch'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://dr-project-backend.onrender.com/api/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, new_password: formData.newPassword, otp: formData.otp })
      });
      if (res.ok) {
        setSuccess('Password Updated');
        setTimeout(() => { switchMode('login'); }, 2000);
      } else { setError('Update Failed'); }
    } catch (err) { setError('Server Error'); } finally { setLoading(false); }
  };

  // Helper text
  const getTitle = () => mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password";
  const getSubtitle = () => {
    if (mode === "login") return "Please enter your details to sign in.";
    if (mode === "signup" && signupStep === 0) return "Enter email to verify your identity.";
    if (mode === "signup" && signupStep === 1) return "Enter the verification code.";
    if (mode === "signup" && signupStep === 2) return "Setup your profile details.";
    return "Secure password recovery.";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes scanMove { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes spinSlow { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes spinReverse { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px hsla(199,89%,48%,0.2)} 50%{box-shadow:0 0 40px hsla(199,89%,48%,0.4)} }
        @keyframes dataStream { 0%{opacity:0;transform:translateY(5px)} 50%{opacity:1} 100%{opacity:0;transform:translateY(-5px)} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .brand-panel { display: none; }
        @media (min-width: 1024px) { .brand-panel { display: flex; } }
      `}</style>

      {/* MAIN CONTAINER: Full Height, No Scroll */}
      <div style={{
        display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
        fontFamily: "'Inter',sans-serif", background: "hsl(0 0% 100%)",
      }}>
        
        {/* LEFT BRAND PANEL (Fixed) */}
        <div style={{
          width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, hsl(222 84% 5%) 0%, hsl(224 71% 12%) 40%, hsl(222 47% 11%) 100%)",
          position: "relative", overflow: "hidden",
        }} className="brand-panel">
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: 40 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{
                width: 80, height: 80, margin: "0 auto 24px", borderRadius: 20,
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 40 }}>👁️</span>
              </div>
              <h1 style={{
                fontSize: 32, fontWeight: 800, color: "white", marginBottom: 12,
                letterSpacing: "-0.02em", textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}>
                Research Eye Care
              </h1>
              <p style={{ fontSize: 16, color: "hsl(199 92% 64%)", fontWeight: 400 }}>
                AI-Powered Retinal Diagnostic System
              </p>
            </motion.div>
            <div style={{ animation: "float 3s ease-in-out infinite" }}>
              <RetinaScanner />
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          background: "hsl(0 0% 100%)",
          overflowY: "auto"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            padding: "60px 20px"
          }}>

            
            {/* --- ADDED LOGO HEADER (Visible on Right Side) --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, hsl(222 84% 5%), hsl(222 47% 11%))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 18 }}>👁️</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "hsl(215 28% 10%)" }}>Research Eye Care</span>
            </div>
            {/* ----------------------------------------------- */}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode + signupStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: "hsl(215 28% 10%)", marginBottom: 6, letterSpacing: "-0.02em" }}>
                    {getTitle()}
                  </h2>
                  <p style={{ fontSize: 14, color: "hsl(215 16% 47%)" }}>{getSubtitle()}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 16, padding: 10, borderRadius: 8, background: "hsl(0 84% 60% / 0.08)", color: "hsl(0 72% 40%)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    ⚠️ {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 16, padding: 10, borderRadius: 8, background: "hsl(152 76% 36% / 0.08)", color: "hsl(152 69% 25%)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    ✅ {success}
                  </motion.div>
                )}

                <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* LOGIN MODE */}
                  {mode === "login" && (
                    <>
                      <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                        style={{
                          width: "100%", 
                          padding: "14px",
                          borderRadius: 10, 
                          border: "2px solid hsl(214 32% 91%)",
                          background: "white", 
                          fontWeight: 600, 
                          fontSize: 14, 
                          color: "hsl(215 25% 27%)",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          gap: 10,
                          cursor: "pointer", 
                          transition: "all 0.2s",
                          boxSizing: "border-box",
                          height: "50px",
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.borderColor = "hsl(221 83% 53% / 0.3)"; 
                          e.currentTarget.style.boxShadow = "0 4px 12px hsla(221,83%,53%,0.08)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.borderColor = "hsl(214 32% 91%)"; 
                          e.currentTarget.style.boxShadow = "none"; 
                        }}
                      >
                        <GoogleIcon /> Sign in with Google
                      </button>
                      
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        margin: "16px 0",
                        width: "100%"
                      }}>
                        <div style={{
                          flex: 1,
                          height: 1,
                          background: "hsl(214 32% 91%)"
                        }} />
                        
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "hsl(215 16% 47%)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "0 4px"
                        }}>
                          OR
                        </span>

                        <div style={{
                          flex: 1,
                          height: 1,
                          background: "hsl(214 32% 91%)"
                        }} />
                      </div>

                      <InputField label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" />
                      <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => switchMode("forgot")}
                          style={{ fontSize: 13, fontWeight: 600, color: "hsl(221 83% 53%)", background: "none", border: "none", cursor: "pointer" }}>
                          Forgot Password?
                        </button>
                      </div>
                      <SubmitButton loading={loading} onClick={handleLogin}>Sign In</SubmitButton>
                    </>
                  )}

                  {/* SIGNUP MODE */}
                  {mode === "signup" && signupStep === 0 && (
                    <>
                      <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                      <SubmitButton loading={loading} onClick={handleSignupSendOTP}>Send Verification Code</SubmitButton>
                    </>
                  )}
                  {mode === "signup" && signupStep === 1 && (
                    <>
                      <div style={{ padding: 10, borderRadius: 8, background: "hsl(221 83% 53% / 0.06)", color: "hsl(221 83% 53%)", fontSize: 13, textAlign: "center", fontWeight: 500 }}>
                        OTP sent to {formData.email}
                      </div>
                      <InputField label="Enter OTP" name="otp" value={formData.otp} onChange={handleChange} placeholder="6-digit code" style={{textAlign: 'center', letterSpacing: '4px'}} />
                      <SubmitButton loading={loading} onClick={handleSignupVerifyOTP}>Verify Email</SubmitButton>
                      {countdown > 0 && <p style={{ textAlign: "center", fontSize: 13, color: "hsl(215 16% 47%)" }}>Resend in {countdown}s</p>}
                    </>
                  )}
                  {mode === "signup" && signupStep === 2 && (
                    <>
                      <div style={{display:'flex', gap: 10}}>
                         <div style={{flex:1}}><InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Dr. Name" /></div>
                         <div style={{flex:1}}><InputField label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="User ID" /></div>
                      </div>
                      <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />
                      <InputField label="Confirm" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat Password" />
                      <SubmitButton loading={loading} onClick={handleCompleteSignup}>Complete Registration</SubmitButton>
                    </>
                  )}

                  {/* FORGOT PASSWORD */}
                  {mode === "forgot" && (
                    <>
                      {!otpSent ? (
                        <>
                          <InputField label="Registered Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                          <SubmitButton loading={loading} onClick={handleForgotSendOTP}>Send OTP</SubmitButton>
                        </>
                      ) : !otpVerified ? (
                        <>
                          <InputField label="Enter OTP" name="otp" value={formData.otp} onChange={handleChange} placeholder="6-digit code" style={{textAlign: 'center', letterSpacing: '4px'}}/>
                          <SubmitButton loading={loading} onClick={handleForgotVerifyOTP}>Verify Code</SubmitButton>
                        </>
                      ) : (
                         <>
                           <InputField label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="New password" />
                           <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
                           <SubmitButton loading={loading} onClick={handleResetPassword}>Reset Password</SubmitButton>
                         </>
                      )}
                      <button type="button" onClick={() => switchMode("login")}
                        style={{ fontSize: 13, fontWeight: 600, color: "hsl(221 83% 53%)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                        ← Back to Login
                      </button>
                    </>
                  )}
                </form>

                {mode === "login" && (
                  <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "hsl(215 16% 47%)" }}>
                    New User? <button onClick={() => switchMode("signup")} style={{ fontWeight: 700, color: "hsl(221 83% 53%)", background: "none", border: "none", cursor: "pointer" }}>Sign Up Here</button>
                  </p>
                )}
                {mode === "signup" && (
                  <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "hsl(215 16% 47%)" }}>
                    Already have an account? <button onClick={() => switchMode("login")} style={{ fontWeight: 700, color: "hsl(221 83% 53%)", background: "none", border: "none", cursor: "pointer" }}>Sign In</button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;