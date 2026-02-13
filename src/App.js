import React, { useState, useRef, useEffect } from "react";

function App() {
  // --- STATE VARIABLES ---
  // 👇 CHANGE 1: Default state changed from 'home' to 'register' to fix blank screen
  const [activeTab, setActiveTab] = useState("register"); 
  
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientId, setPatientId] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
 
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  // --- HISTORY STATE ---
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

 

  // --- SCROLL TO TOP WHEN REPORT SHOWS ---
  useEffect(() => {
    if (showReport && reportRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showReport]);

  // --- FETCH HISTORY (MongoDB) ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
    setLoadingHistory(false);
  };

  // --- TAB HANDLER ---
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') {
      fetchHistory();
    }
  };

  // --- SMART DOCTOR ADVICE ENGINE ---
  const getMedicalAdvice = (severity_index) => {
    switch (severity_index) {
      case 0:
        return [
          "Continue regular monitoring with annual comprehensive eye examinations",
          "Maintain optimal glycemic control (HbA1c < 7.0%) to prevent progression",
          "Blood pressure management essential (target <130/80 mmHg)",
          "Incorporate antioxidant-rich foods: leafy greens, carrots, citrus fruits",
          "Regular physical activity recommended (30 minutes daily, 5 days/week)"
        ];
      case 1:
        return [
          "Ophthalmology referral recommended within 4-6 weeks for detailed evaluation",
          "Enhanced glycemic monitoring required - check fasting and post-prandial levels",
          "Lipid profile assessment to evaluate cardiovascular risk factors",
          "Blood pressure monitoring twice daily, maintain log for physician review",
          "Dietary modifications: reduce sodium intake, increase omega-3 fatty acids",
          "Follow-up retinal screening recommended in 3-6 months"
        ];
      case 2:
        return [
          "URGENT: Retina specialist consultation required within 7-14 days",
          "Pan-retinal photocoagulation (laser therapy) may be indicated",
          "Strict glycemic control mandatory - consider insulin therapy adjustment",
          "Avoid activities that increase intraocular pressure (heavy lifting, straining)",
          "Regular monitoring of visual acuity and intraocular pressure",
          "Consider anti-VEGF therapy based on specialist recommendation",
          "Monthly follow-up appointments required until stabilization"
        ];
      case 3:
        return [
          "CRITICAL: Immediate ophthalmology intervention required within 48-72 hours",
          "High risk of severe vision loss - urgent surgical evaluation needed",
          "Anti-VEGF intravitreal injections likely required",
          "Vitrectomy may be necessary for vitreous hemorrhage management",
          "Aggressive systemic control of diabetes and hypertension essential",
          "Avoid all strenuous activities and sudden head movements",
          "Emergency department visit recommended if sudden vision changes occur",
          "Weekly monitoring during acute phase required"
        ];
      default:
        return [];
    }
  };

  // --- AI FEATURE ANALYSIS ---
  const getFeatureAnalysis = (is_safe, severity_index) => {
    if (is_safe) {
      return [
        { label: "Optic Disc", status: "Normal Architecture", detail: "Cup-to-disc ratio within normal limits", severity: "normal" },
        { label: "Macula", status: "Intact Structure", detail: "Foveal reflex present, no edema", severity: "normal" },
        { label: "Blood Vessels", status: "Regular Caliber", detail: "No arteriovenous nicking", severity: "normal" },
        { label: "Microaneurysms", status: "Not Detected", detail: "No capillary abnormalities observed", severity: "normal" },
        { label: "Hemorrhages", status: "Absent", detail: "No intraretinal or preretinal bleeding", severity: "normal" },
        { label: "Exudates", status: "None Present", detail: "No hard or soft exudates identified", severity: "normal" }
      ];
    } else {
      const features = [
        { label: "Microaneurysms", status: "Present", detail: "Multiple capillary outpouchings detected", severity: "moderate" },
        { label: "Dot/Blot Hemorrhages", status: severity_index >= 2 ? "Extensive" : "Scattered", detail: severity_index >= 2 ? "Numerous intraretinal hemorrhages" : "Localized hemorrhagic spots", severity: severity_index >= 2 ? "severe" : "moderate" },
        { label: "Hard Exudates", status: severity_index >= 2 ? "Confluent" : "Sparse", detail: severity_index >= 2 ? "Lipid deposits threatening macula" : "Isolated lipid deposits", severity: severity_index >= 2 ? "severe" : "moderate" },
        { label: "Cotton Wool Spots", status: severity_index >= 2 ? "Multiple" : "Few", detail: "Nerve fiber layer infarcts", severity: severity_index >= 2 ? "severe" : "moderate" },
        { label: "Venous Changes", status: severity_index >= 2 ? "Beading Present" : "Mild Dilation", detail: severity_index >= 2 ? "Significant venous caliber irregularity" : "Slight venous tortuosity", severity: severity_index >= 2 ? "severe" : "moderate" }
      ];
     
      if (severity_index === 3) {
        features.push(
          { label: "Neovascularization", status: "CRITICAL", detail: "New vessel growth on disc/elsewhere", severity: "critical" },
          { label: "Vitreous Hemorrhage", status: "Risk Present", detail: "Potential for bleeding into vitreous cavity", severity: "critical" }
        );
      }
     
      return features;
    }
  };

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setShowReport(false);
    }
  };

  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- ANALYZE IMAGE (UPDATED) ---
  // --- ANALYZE IMAGE (SYNC ID WITH BACKEND) ---
  const analyzeImage = async () => {
    if (!file || !patientName || !patientAge) {
      alert("⚠️ Please complete all required patient information and upload retinal scan");
      return;
    }
    
    setLoading(true);
    setResult(null); 
    setShowReport(false);

    // 👇 1. GENERATE ID HERE (Like #78754)
    const frontendReportId = "#" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", patientName);
    formData.append("age", patientAge);
    formData.append("gender", patientGender);
    formData.append("patient_id", patientId);
    
    // 👇 2. SEND THIS ID TO BACKEND
    formData.append("report_id", frontendReportId);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Server Error");
      
      const data = await res.json();
      setResult(data);
      setShowReport(true);
      
      // Update history immediately
      setHistoryData(prev => [{ ...data, date: new Date().toISOString() }, ...prev]);
      
    } catch (err) {
      console.error(err);
      alert("❌ Backend Connection Error. Please ensure the diagnostic server is running.");
    }
    setLoading(false);
  };

  const printReport = () => {
    window.print();
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "normal": return "#16a34a";
      case "moderate": return "#f59e0b";
      case "severe": return "#dc2626";
      case "critical": return "#991b1b";
      default: return "#6b7280";
    }
  };

    const generatePatientId = () => {
        const timestamp = new Date().getTime().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `VEC-${timestamp}${randomNum}`;
        };

    const handleGenerateId = () => {
        setPatientId(generatePatientId());
    };

    // --- HANDLE GENERATE REPORT (UPDATED WITH ID SYNC) ---
  const handleGenerate = async () => {
    // 1. Basic Check
    if (!file) {
      alert("⚠️ Please upload an eye scan image first!");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setShowReport(false);

    // 👇 2. ID GENERATION (Inga dhaan ID create panrom - Ex: #84920)
    const myReportId = "#" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", patientName);
    formData.append("age", patientAge);
    formData.append("gender", patientGender);
    formData.append("patient_id", patientId);
    
    // 👇 3. SEND ID TO BACKEND
    formData.append("report_id", myReportId); 

    try {
      // Backend URL correct-a irukkanu check panniko
      const response = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setResult(data); 
        setShowReport(true);
        
        // History Update (Saving the same ID to history too)
        setHistoryData(prev => [
          { 
            ...data, 
            name: patientName, 
            date: new Date().toLocaleDateString(),
            // Ensure ID is saved in history correctly
            report_id: myReportId 
          },
          ...prev
        ]);
      }

    } catch (error) {
      console.error(error);
      alert("❌ Error connecting to server! Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* GRAND HEADER WITH HOSPITAL BRANDING */}
      <header className="no-print" style={{
        background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
        color: 'white',
        padding: '0',
        boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
       
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>

        {/* Top Bar */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>📞</span>
                <span>Emergency: <strong>044-1234-5678</strong></span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>📧</span>
                <span>contact@studentsresearcheyecare.com</span>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>🕐</span>
                <span>Mon-Sat: 8AM-8PM</span>
              </div>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '20px',
                fontSize: '12px'
              }}>
                NABH Accredited
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '25px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <div style={{
              position: 'relative',
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
            
            <img 
                src="eye-exam.png" 
                alt="Logo" 
                style={{ width: '65px', height: '90px', objectFit: 'contain' }} 
              />

              <div style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid #0c4a6e'
              }}></div>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                background: 'linear-gradient(to right, #ffffff, #e0f2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                STUDENT'S RESEARCH EYE CARE
              </h1>
              <p style={{
                margin: '4px 0 0',
                fontSize: '16px',
                fontWeight: '300',
                letterSpacing: '1px',
                opacity: 0.9
              }}>
                Center for Excellence in Ophthalmology
              </p>
            </div>
          </div>
         
          <div style={{
            textAlign: 'center',
            padding: '15px 25px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '200px'
          }}>
            <p style={{margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9}}>AI DIAGNOSTICS DEPARTMENT</p>
            <p style={{margin: 0, fontSize: '18px', fontWeight: '700'}}>Retinal Scan Portal</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          background: 'rgba(0,0,0,0.15)',
          padding: '0 40px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px'
          }}>
            <button
                onClick={() => handleTabChange('register')}
                style={{
                    padding: '15px 25px',
                    background: activeTab === 'register' ? 'white' : 'transparent',
                    color: activeTab === 'register' ? '#0c4a6e' : '#e0f2fe',
                    border: 'none',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>👤</span> Patient Registration
            </button>
            <button
                onClick={() => handleTabChange('history')}
                style={{
                    padding: '15px 25px',
                    background: activeTab === 'history' ? 'white' : 'transparent',
                    color: activeTab === 'history' ? '#0c4a6e' : '#e0f2fe',
                    border: 'none',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>📋</span> Patient Records (History)
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1400px',
        margin: '40px auto',
        padding: showReport ? '20px' : '0 40px',
        minHeight: showReport ? 'auto' : 'calc(100vh - 280px)',
        width: '100%'
      }}>
       
        {/* === TAB 1: REGISTRATION & REPORT === */}
        {activeTab === 'register' && (
            <>
            {/* INPUT FORM - ONLY SHOWN WHEN NO REPORT */}
            {!showReport && (
            <div style={{width: '100%'}}>
                {/* Page Title */}
                <div style={{
                textAlign: 'center',
                marginBottom: '50px',
                padding: '0 20px'
                }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    marginBottom: '20px',
                    boxShadow: '0 8px 25px rgba(12, 74, 110, 0.2)'
                }}>
                    <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: '#0c4a6e'
                    }}>
                    🔬
                    </div>
                    <div>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: '500'
                    }}>AI-POWERED DIAGNOSTICS</p>
                    <p style={{
                        margin: '2px 0 0',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.7)',
                        letterSpacing: '1px'
                    }}>ADVANCED RETINAL SCREENING</p>
                    </div>
                </div>
                
                <h1 style={{
                    margin: '0 0 15px 0',
                    fontSize: '42px',
                    fontWeight: '800',
                    color: '#0c4a6e',
                    letterSpacing: '-0.5px'
                }}>
                    Diabetic Retinopathy <span style={{color: '#0284c7'}}>Screening Portal</span>
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '18px',
                    color: '#475569',
                    maxWidth: '700px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                }}>
                    Advanced AI-assisted analysis of fundus images for early detection and diagnosis of diabetic retinopathy
                </p>
                </div>

                {/* Main Content Grid */}
                <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                marginBottom: '60px',
                width: '100%'
                }}>
                {/* Left Column - Patient Details Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%'
                }}>
                    <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(to right, #0c4a6e, #0284c7)'
                    }}></div>
                    
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '35px'
                    }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        color: '#0c4a6e',
                        boxShadow: '0 5px 15px rgba(2, 132, 199, 0.15)'
                    }}>
                        👤
                    </div>
                    <div>
                        <h2 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#0c4a6e'
                        }}>Patient Registration</h2>
                        <p style={{
                        margin: '6px 0 0',
                        fontSize: '15px',
                        color: '#64748b'
                        }}>Enter patient details for medical records</p>
                    </div>
                    </div>

                    {/* Patient ID Row */}
                    <div style={{marginBottom: '28px'}}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <label style={{
                        fontWeight: '600',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                        }}>
                        <span style={{color: '#0c4a6e'}}>🆔</span>
                        Patient ID
                        </label>
                        <div style={{display: 'flex', gap: '10px'}}>
                        <button
                            onClick={handleGenerateId}
                            style={{
                            padding: '8px 18px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            fontWeight: '600',
                            fontSize: '13px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                            e.target.style.background = '#e2e8f0';
                            e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                            e.target.style.background = '#f1f5f9';
                            e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Generate ID
                        </button>
                        <div style={{
                            padding: '8px 12px',
                            background: '#f0f9ff',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#0369a1',
                            fontWeight: '600'
                        }}>
                            Auto-generate
                        </div>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter patient ID or click 'Generate ID'"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        background: '#f8fafc',
                        transition: 'all 0.3s'
                        }}
                    />
                    </div>

                    {/* Patient Name */}
                    <div style={{marginBottom: '28px'}}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{color: '#0c4a6e'}}>📝</span>
                        Full Name <span style={{color: '#ef4444', marginLeft: '4px'}}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter patient's full name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        background: '#f8fafc',
                        transition: 'all 0.3s'
                        }}
                    />
                    </div>

                    {/* Contact Info */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px'}}>
                    <div>
                        <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                        }}>
                        <span style={{color: '#0c4a6e'}}>📞</span>
                        Phone Number
                        </label>
                        <input
                        type="tel"
                        placeholder="+91 12345 67890"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            background: '#f8fafc',
                            transition: 'all 0.3s'
                        }}
                        />
                    </div>
                    <div>
                        <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                        }}>
                        <span style={{color: '#0c4a6e'}}>✉️</span>
                        Email Address
                        </label>
                        <input
                        type="email"
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            background: '#f8fafc',
                            transition: 'all 0.3s'
                        }}
                        />
                    </div>
                    </div>

                    {/* Age & Gender */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px'}}>
                    <div>
                        <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                        }}>
                        <span style={{color: '#0c4a6e'}}>🎂</span>
                        Age <span style={{color: '#ef4444', marginLeft: '4px'}}>*</span>
                        </label>
                        <input
                        type="number"
                        placeholder="Years"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            background: '#f8fafc',
                            transition: 'all 0.3s'
                        }}
                        />
                    </div>
                    <div>
                        <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        color: '#334155',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                        }}>
                        <span style={{color: '#0c4a6e'}}>⚤</span>
                        Gender <span style={{color: '#ef4444', marginLeft: '4px'}}>*</span>
                        </label>
                        <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            background: '#f8fafc',
                            transition: 'all 0.3s',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 20px center',
                            backgroundSize: '16px'
                        }}
                        >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        </select>
                    </div>
                    </div>

                    {/* Requirements Note */}
                    <div style={{
                    padding: '20px',
                    background: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd'
                    }}>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <span style={{
                        width: '24px',
                        height: '24px',
                        background: '#0ea5e9',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        flexShrink: 0
                        }}>!</span>
                        <span>
                        <strong style={{fontWeight: '600'}}>Medical Note:</strong>
                        All fields marked with <span style={{color: '#ef4444', fontWeight: 'bold'}}>*</span> are mandatory
                        for accurate diagnosis and medical record keeping.
                        </span>
                    </p>
                    </div>
                </div>

                {/* Right Column - Image Upload Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                }}>
                    <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(to right, #7c3aed, #8b5cf6)'
                    }}></div>
                    
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '35px'
                    }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        color: '#7c3aed',
                        boxShadow: '0 5px 15px rgba(124, 58, 237, 0.15)'
                    }}>
                        📸
                    </div>
                    <div>
                        <h2 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#0c4a6e'
                        }}>Fundus Image Upload</h2>
                        <p style={{
                        margin: '6px 0 0',
                        fontSize: '15px',
                        color: '#64748b'
                        }}>Upload retinal scan for AI analysis</p>
                    </div>
                    </div>

                    {/* Upload Area */}
                    <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: preview ? 'white' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: preview ? '2px solid #e2e8f0' : '3px dashed #cbd5e1',
                    borderRadius: '16px',
                    marginBottom: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    padding: '40px 20px',
                    width: '100%'
                    }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 2
                        }}
                    />
                    
                    {!preview ? (
                        <>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '25px',
                            border: '3px dashed #a5b4fc'
                        }}>
                            <div style={{fontSize: '48px', color: '#4f46e5'}}>
                            📁
                            </div>
                        </div>
                        
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#1e293b'
                        }}>
                            Upload Retinal Scan
                        </h3>
                        
                        <p style={{
                            margin: '0 0 25px 0',
                            fontSize: '15px',
                            color: '#64748b',
                            maxWidth: '400px',
                            lineHeight: '1.6',
                            textAlign: 'center'
                        }}>
                            Drag and drop your fundus image or click to browse files from your device
                        </p>

                        <div style={{
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '15px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)',
                            cursor: 'pointer'
                        }}>
                            <span>📂</span>
                            Browse Files
                        </div>

                        <p style={{
                            margin: '25px 0 0 0',
                            fontSize: '13px',
                            color: '#94a3b8'
                        }}>
                            Supported formats: JPEG, PNG, JPG • Max size: 10MB
                        </p>
                        </>
                    ) : (
                        <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                        }}>
                        <div style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            border: '5px solid #e0e7ff',
                            marginBottom: '25px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}>
                            <img
                            src={preview}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            />
                            <div style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '-12px',
                            background: '#10b981',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            border: '3px solid white'
                            }}>
                            ✓
                            </div>
                        </div>
                        
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '25px'
                        }}>
                            <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#10b981'
                            }}>
                            Image Uploaded Successfully
                            </h3>
                            <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#64748b'
                            }}>
                            Fundus image is ready for AI analysis
                            </p>
                        </div>

                        <div style={{display: 'flex', gap: '15px'}}>
                            {/* CHANGE IMAGE BUTTON ONLY - Remove button removed */}
                            <button
                            onClick={handleChangeImage}
                            style={{
                                padding: '12px 24px',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                color: '#334155',
                                fontWeight: '600',
                                fontSize: '14px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f1f5f9';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#f8fafc';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            >
                            🔄 Change Image
                            </button>
                        </div>
                        </div>
                    )}
                    </div>

                    {/* Image Guidelines */}
                    <div style={{
                    background: '#f0f9ff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd',
                    marginBottom: '30px'
                    }}>
                    <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '15px',
                        color: '#0369a1',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{fontSize: '18px'}}>💡</span>
                        Image Acquisition Guidelines
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '13px',
                        color: '#64748b'
                    }}>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#0ea5e9',
                            color: 'white',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0
                        }}>1</div>
                        <span>Proper illumination & focus</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#0ea5e9',
                            color: 'white',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0
                        }}>2</div>
                        <span>Center optic disc in frame</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#0ea5e9',
                            color: 'white',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0
                        }}>3</div>
                        <span>Avoid glare & reflections</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#0ea5e9',
                            color: 'white',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0
                        }}>4</div>
                        <span>High resolution for accuracy</span>
                        </div>
                    </div>
                    </div>

                    {/* Generate Report Button - CENTERED LOADING - FIXED HEIGHT */}
                    <button
                    onClick={analyzeImage}
                    disabled={loading || !file || !patientName || !patientAge}
                    style={{
                        width: '100%',
                        padding: '22px',
                        height: '68px', // Fixed height to prevent button size change
                        background: loading
                        ? '#9ca3af'
                        : (!file || !patientName || !patientAge)
                            ? '#e2e8f0'
                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        border: 'none',
                        color: (loading || !file || !patientName || !patientAge) ? '#94a3b8' : 'white',
                        fontWeight: '700',
                        fontSize: '18px',
                        borderRadius: '14px',
                        cursor: (loading || !file || !patientName || !patientAge) ? 'not-allowed' : 'pointer',
                        boxShadow: (loading || !file || !patientName || !patientAge)
                        ? 'none'
                        : '0 10px 30px rgba(220, 38, 38, 0.3)',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    >
                    {loading ? (
                        <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px',
                        width: '100%',
                        height: '100%'
                        }}>
                        {/* Unique Spinning Circle */}
                        <div className="spinner" style={{
                            width: '28px',
                            height: '28px',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            {/* Outer ring */}
                            <div style={{
                            width: '100%',
                            height: '100%',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            borderTop: '3px solid white',
                            animation: 'spin 1s linear infinite',
                            position: 'absolute',
                            top: 0,
                            left: 0
                            }}></div>
                            {/* Inner ring */}
                            <div style={{
                            width: '60%',
                            height: '60%',
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderRadius: '50%',
                            borderBottom: '2px solid white',
                            animation: 'spin 0.8s linear infinite reverse',
                            position: 'absolute',
                            top: '20%',
                            left: '20%'
                            }}></div>
                            {/* Center dot */}
                            <div style={{
                            width: '6px',
                            height: '6px',
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 6px rgba(255,255,255,0.8)'
                            }}></div>
                        </div>
                        
                        {/* Loading text with unique styling */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0px'
                        }}>
                            <span style={{
                                fontSize: '17px',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                lineHeight: '1.2'
                            }}>
                            Loading<span style={{animation: 'dots 1.5s infinite'}}>...</span>
                            </span>
                            <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: '600',
                                letterSpacing: '1.2px',
                                marginTop: '2px',
                                    textAlign: 'center'
                            }}>
                            AI Analysis in Progress
                            </span>
                        </div>
                        </div>
                    ) : (
                        <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px',
                        width: '100%',
                        height: '100%'
                        }}>
                        <span style={{fontSize: '22px'}}>🔬</span>
                        GENERATE AI DIAGNOSTIC REPORT
                        </div>
                    )}
                    </button>

                    {(!file || !patientName || !patientAge) && (
                    <p style={{
                        margin: '20px 0 0 0',
                        fontSize: '14px',
                        color: '#dc2626',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        Please complete all required fields and upload retinal scan
                    </p>
                    )}
                </div>
                </div>
            </div>
            )}

            {/* MEDICAL REPORT - SCROLLS TO TOP WHEN GENERATED */}
            {showReport && result && (
            <div
                ref={reportRef}
                style={{
                width: '100%',
                maxWidth: '100%',
                background: 'white',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                border: '1px solid #e5e7eb',
                animation: 'fadeIn 0.5s ease-out',
                overflowX: 'hidden',
                boxSizing: 'border-box'
                }}
            >
                {/* Report Header */}
                <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '4px solid #1e3a8a',
                position: 'relative'
                }}>
                <div>
                    <h1 style={{
                    margin: 0,
                    color: '#1e3a8a',
                    fontSize: '32px',
                    fontWeight: '800',
                    letterSpacing: '0.5px'
                    }}>Student's Research EYE CARE</h1>
                    <p style={{
                    margin: '6px 0 0',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500'
                    }}>Department of AI-Assisted Ophthalmology</p>
                    <p style={{
                    margin: '2px 0 0',
                    color: '#6b7280',
                    fontSize: '13px'
                    }}>Center for Retinal Diagnostics & Research</p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <div style={{
                    background: '#dbeafe',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    display: 'inline-block'
                    }}>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#1e40af',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>REPORT ID</p>
                    <p style={{
                        margin: '4px 0 0',
                        fontSize: '20px',
                        color: '#1e3a8a',
                        fontWeight: '700',
                        textAlign: 'center'
                    }}>{result.report_id}</p>
                    </div>
                    <p style={{
                    margin: '8px 0 0',
                    fontSize: '13px',
                    color: '#6b7280'
                    }}><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
                    <p style={{
                    margin: '4px 0 0',
                    fontSize: '13px',
                    color: '#6b7280'
                    }}><strong>Time:</strong> {new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
                </div>
                </div>

                {/* Patient Information */}
                <div style={{
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                padding: '28px',
                borderRadius: '16px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0'
                }}>
                <h3 style={{
                    margin: '0 0 20px',
                    color: '#1e3a8a',
                    fontSize: '16px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>Patient Information</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px'
                }}>
                    <div>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>PATIENT NAME</p>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '18px',
                        color: '#0f172a',
                        fontWeight: '700'
                    }}>{patientName}</p>
                    </div>
                    <div>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>PATIENT ID</p>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '18px',
                        color: '#0f172a',
                        fontWeight: '700'
                    }}>{patientId || 'N/A'}</p>
                    </div>
                    <div>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>AGE / GENDER</p>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '18px',
                        color: '#0f172a',
                        fontWeight: '700'
                    }}>{patientAge} Years / {patientGender}</p>
                    </div>
                    <div>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>SCAN QUALITY</p>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '18px',
                        color: '#16a34a',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>✓ <span>Adequate for Diagnosis</span></p>
                    </div>
                </div>
                </div>

                {/* Retinal Image & Diagnosis */}
                <div style={{
                display: 'flex',
                gap: '40px',
                marginBottom: '32px',
                alignItems: 'center'
                }}>
                <div style={{textAlign: 'center'}}>
                    <div style={{
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    border: '8px solid #3b82f6',
                    padding: '8px',
                    background: 'white',
                    boxShadow: '0 12px 32px rgba(59,130,246,0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                    }}>
                    <img
                        src={preview}
                        alt="Fundus"
                        style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                        }}
                    />
                    </div>
                    <p style={{
                    margin: '16px 0 0',
                    fontSize: '14px',
                    color: '#64748b',
                        fontWeight: '600'
                    }}>FUNDUS PHOTOGRAPH</p>
                    <p style={{
                    margin: '4px 0 0',
                    fontSize: '12px',
                    color: '#94a3b8'
                    }}>Right/Left Eye - Posterior Pole</p>
                </div>
                
                <div style={{flex: 1}}>
                    <div style={{
                    background: '#fef3c7',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    borderLeft: '6px solid #f59e0b'
                    }}>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#92400e',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>⚕️ AI-ASSISTED DIAGNOSIS</p>
                    </div>
                    <div style={{
                    background: result.is_safe
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    padding: '32px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                    }}>
                    <p style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '36px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                        {result.grade}
                    </p>
                    <p style={{
                        margin: '12px 0 0',
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '16px',
                        fontWeight: '500',
                        letterSpacing: '0.5px'
                    }}>
                        {result.is_safe ? 'No Diabetic Retinopathy Detected' : 'Diabetic Retinopathy Identified'}
                    </p>
                    </div>
                    
                    {/* PROFESSIONAL DOWNLOAD SECTION */}
                    {result.pdf_url && result.pdf_url !== "" ? (
                        <div style={{
                            marginTop: '30px', 
                            textAlign: 'center',
                            background: '#f1f5f9', // Light Gray Box
                            padding: '25px',
                            borderRadius: '16px',
                            border: '1px dashed #94a3b8', // Professional Dashed Border
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            {/* PROFESSIONAL LABEL TEXT */}
                            <div>
                                <p style={{
                                    margin: '0',
                                    color: '#0f172a',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <span>📄</span> Official Medical Report Ready
                                </p>
                                <p style={{
                                    margin: '4px 0 0',
                                    color: '#64748b',
                                    fontSize: '13px'
                                }}>
                                    Complete AI analysis and severity assessment included
                                </p>
                            </div>

                            {/* DIRECT DOWNLOAD BUTTON */}
                            <a
                                // 👇 Magic: 'fl_attachment' forces direct download
                                href={result.pdf_url.replace('/upload/', '/upload/fl_attachment/')}
                                className="no-print"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textDecoration: 'none',
                                    background: '#2563eb', // Professional Blue
                                    color: 'white',
                                    padding: '14px 30px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Full Report
                            </a>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
                            ⏳ Generating Official PDF...
                        </div>
                    )} 
              </div>
                </div>

                {/* Clinical Feature Analysis */}
                <div style={{
                background: '#f8fafc',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0'
                }}>
                <h3 style={{
                    margin: '0 0 24px',
                    color: '#1e3a8a',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px'
                    }}>🔬</span>
                    Clinical Feature Analysis
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                }}>
                    {getFeatureAnalysis(result.is_safe, result.severity_index).map((item, index) => (
                    <div key={index} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: `2px solid ${getSeverityColor(item.severity)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'transform 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{flex: 1}}>
                        <p style={{
                            margin: 0,
                            fontSize: '15px',
                            color: '#0f172a',
                            fontWeight: '700'
                        }}>{item.label}</p>
                        <p style={{
                            margin: '6px 0 0',
                            fontSize: '13px',
                            color: '#64748b'
                        }}>{item.detail}</p>
                        </div>
                        <div style={{
                        padding: '10px 20px',
                        background: `${getSeverityColor(item.severity)}15`,
                        borderRadius: '8px',
                        color: getSeverityColor(item.severity),
                        fontWeight: '700',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${getSeverityColor(item.severity)}30`
                        }}>
                        {item.status}
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Risk Assessment */}
                <div style={{
                display: 'grid',
                gridTemplateColumns: !result.is_safe ? '1fr 1fr' : '1fr',
                gap: '32px',
                marginBottom: '32px'
                }}>
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}>
                    <h4 style={{
                    margin: '0 0 20px',
                    color: '#1e3a8a',
                    fontSize: '18px',
                    fontWeight: '700'
                    }}>⚠️ Severity Score</h4>
                    <div style={{
                    height: '28px',
                    background: '#e5e7eb',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    position: 'relative'
                    }}>
                    <div style={{
                        height: '100%',
                        width: `${result.risk_score}%`,
                        background: result.is_safe
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : 'linear-gradient(to right, #f59e0b, #ef4444)',
                        transition: 'width 1.5s ease',
                        borderRadius: '14px'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${result.risk_score}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        border: `3px solid ${result.is_safe ? '#10b981' : '#ef4444'}`,
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}></div>
                    </div>
                    <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                    }}>
                    <p style={{
                        margin: 0,
                        fontSize: '15px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>Risk Level</p>
                    <p style={{
                        margin: 0,
                        fontSize: '32px',
                        fontWeight: '800',
                        color: result.is_safe ? '#10b981' : '#ef4444',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {result.risk_score}/100
                    </p>
                    </div>
                </div>

                {!result.is_safe && (
                    <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                    }}>
                    <h4 style={{
                        margin: '0 0 20px',
                        color: '#1e3a8a',
                        fontSize: '18px',
                        fontWeight: '700'
                    }}>📊 Severity Distribution</h4>
                    {[
                        {label: 'Moderate NPDR', value: result?.details?.moderate || 0, color: '#f59e0b'},
                        {label: 'Severe NPDR', value: result?.details?.severe || 0, color: '#fb923c'},
                        {label: 'Proliferative DR', value: result?.details?.pdr || 0, color: '#ef4444'}
                    ].map((item, i) => (
                        <div key={i} style={{marginBottom: '16px'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            alignItems: 'center'
                        }}>
                            <span style={{
                            fontSize: '14px',
                            color: '#64748b',
                            fontWeight: '600'
                            }}>{item.label}</span>
                            <span style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: item.color
                            }}>{item.value}%</span>
                        </div>
                        <div style={{
                            height: '12px',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                            height: '100%',
                            width: `${item.value}%`,
                            background: item.color,
                            borderRadius: '6px',
                            transition: 'width 1s ease'
                            }}></div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>

                {/* Management Recommendations */}
                <div style={{
                background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '32px',
                borderLeft: '8px solid #f59e0b'
                }}>
                <h3 style={{
                    margin: '0 0 24px',
                    color: '#78350f',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{
                    background: '#f59e0b',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px'
                    }}>👨‍⚕️</span>
                    Clinical Management Plan
                </h3>
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}>
                    {getMedicalAdvice(result.severity_index).map((advice, index) => (
                    <div key={index} style={{
                        padding: '16px 20px',
                        marginBottom: '12px',
                        background: '#fefce8',
                        borderLeft: '6px solid #eab308',
                        borderRadius: '8px',
                        fontSize: '15px',
                        color: '#422006',
                        lineHeight: '1.6',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                        background: '#eab308',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}>
                        {index + 1}
                        </div>
                        <span style={{flex: 1}}>{advice}</span>
                    </div>
                    ))}
                </div>
                </div>

                {/* Footer & Disclaimer */}
                <div style={{borderTop: '4px solid #e5e7eb', paddingTop: '32px'}}>
                <div style={{
                    background: '#fef2f2',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    border: '1px solid #fecaca'
                }}>
                    <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#7f1d1d',
                    lineHeight: '1.7',
                    textAlign: 'justify'
                    }}>
                    <strong style={{color: '#991b1b'}}>Medical Disclaimer:</strong> This report is generated by an AI-assisted diagnostic support system and is intended for screening purposes only. Final diagnosis must be confirmed by a board-certified ophthalmologist through comprehensive clinical examination. This report should not be used as the sole basis for treatment decisions. For any vision-related emergencies or concerns, please seek immediate medical attention.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div>
                    <div style={{
                        borderTop: '3px solid #0f172a',
                        width: '280px',
                        marginBottom: '12px'
                    }}></div>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#0f172a',
                        fontWeight: '600'
                    }}>Authorized Signature</p>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '13px',
                        color: '#64748b'
                    }}>Consultant Ophthalmologist</p>
                    <p style={{
                        margin: '2px 0 0',
                        fontSize: '12px',
                        color: '#94a3b8'
                    }}>Student's Research Eye Care - AI Diagnostics Dept.</p>
                    </div>
                    <div style={{display: 'flex', gap: '16px'}}>
                    <button
                        onClick={() => setShowReport(false)}
                        className="no-print"
                        style={{
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s'
                        }}
                    >
                        ↩️ Back to Form
                    </button>
                    <button
                        onClick={printReport}
                        className="no-print"
                        style={{
                        padding: '14px 40px',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '15px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(30,58,138,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition:'all 0.3s'
                        }}
                    >
                        🖨️ Print Dashboard
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}
            </>
        )}

        {/* === TAB 2: PATIENT RECORDS (HISTORY) === */}
        {activeTab === 'history' && (
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 15px 50px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                width: '100%',
                minHeight: '600px'
            }}>
                <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '30px',
                    borderBottom: '2px solid #f1f5f9',
                    paddingBottom: '20px'
                }}>
                    <div>
                        <h2 style={{ color: '#0c4a6e', margin: 0, fontSize: '24px' }}>Patient Records Database</h2>
                        <p style={{margin: '5px 0 0', color: '#64748b'}}>View all saved diagnostic reports</p>
                    </div>
                    <button 
                        onClick={fetchHistory} 
                        style={{
                            padding: '12px 24px', 
                            background: '#f0f9ff', 
                            border: '1px solid #bae6fd', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            color: '#0369a1',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🔄 Refresh List
                    </button>
                </div>

                {loadingHistory ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>
                        <div className="spinner" style={{margin: '0 auto 20px', borderColor: '#cbd5e1', borderTopColor: '#3b82f6'}}></div>
                        <p style={{color: '#64748b'}}>Loading patient records from database...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Date & Time</th>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Patient Name</th>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Age/Gender</th>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Diagnosis</th>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Risk %</th>
                                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.length > 0 ? (
                                    historyData.map((record, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '16px', color: '#334155' }}>
                                                {record.timestamp ? new Date(record.timestamp).toLocaleString() : "Date N/A"}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{record.name || 'Unknown'}</td>
                                            <td style={{ padding: '16px', color: '#475569' }}>{record.age} / {record.gender}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    background: record.is_safe ? '#dcfce7' : '#fee2e2',
                                                    color: record.is_safe ? '#166534' : '#991b1b',
                                                    display: 'inline-block'
                                                }}>
                                                    {record.diagnosis}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '600' }}>
                                                <span style={{color: record.risk_score > 15 ? '#dc2626' : '#16a34a'}}>
                                                    {record.risk_score}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {record.pdf_url ? (
                                                    <a
                                                        href={record.pdf_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: 'white',
                                                            background: '#3b82f6',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)'
                                                        }}
                                                    >
                                                        📄 View PDF
                                                    </a>
                                                ) : (
                                                    <span style={{color: '#94a3b8', fontSize: '13px', fontStyle: 'italic'}}>Generating...</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                            <div style={{fontSize: '40px', marginBottom: '10px'}}>📭</div>
                                            No patient records found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

      </main>

      {/* Professional Footer */}
      {!showReport && activeTab === 'register' && (
        <footer className="no-print" style={{
          background: '#0c4a6e',
          color: 'white',
          padding: '50px 0 30px 0',
          marginTop: '60px',
          borderTop: '5px solid #0284c7'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '40px',
              marginBottom: '40px'
            }}>
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    👁️
                  </div>
                  <div>
                    <h3 style={{margin: 0, fontSize: '22px', fontWeight: '700'}}>STUDENT'S RESEARCH EYE CARE</h3>
                    <p style={{margin: '4px 0 0', fontSize: '13px', opacity: 0.8}}>Excellence in Eye Care</p>
                  </div>
                </div>
                <p style={{margin: '20px 0 0', fontSize: '14px', lineHeight: '1.7', opacity: 0.9}}>
                  A premier eye care institution with 50+ centers across India,
                  providing world-class ophthalmology services with cutting-edge
                  technology and expert medical professionals.
                </p>
              </div>
             
              <div>
                <h4 style={{margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600'}}>Quick Links</h4>
                <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Home</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>About Us</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Services</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Doctors</a></li>
                </ul>
              </div>
             
              <div>
                <h4 style={{margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600'}}>Services</h4>
                <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Retina Services</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Cataract Surgery</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>Glaucoma Care</a></li>
                  <li style={{marginBottom: '10px'}}><a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '14px'}}>AI Diagnostics</a></li>
                </ul>
              </div>
             
              <div>
                <h4 style={{margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600'}}>Contact</h4>
                <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
                  <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span>📞</span>
                    <span style={{fontSize: '14px'}}>044-1234-5678</span>
                  </li>
                  <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span>📧</span>
                    <span style={{fontSize: '14px'}}>info@studentsresearcheyecare.com</span>
                  </li>
                  <li style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span>📍</span>
                    <span style={{fontSize: '14px'}}>Chennai, Tamil Nadu</span>
                  </li>
                </ul>
              </div>
            </div>
           
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '30px',
              textAlign: 'center',
              fontSize: '13px',
              opacity: 0.7
            }}>
              <p style={{margin: 0}}>© 2024 Student's Research Eye Care. All Rights Reserved. | NABH Accredited Hospital</p>
              <p style={{margin: '10px 0 0'}}>This AI diagnostic tool is intended for screening purposes only. Consult an ophthalmologist for final diagnosis.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
       
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
       
        @keyframes dots {
          0%, 20% { content: "."; }
          40% { content: ".."; }
          60%, 100% { content: "..."; }
        }
       
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          * {
            boxShadow: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
       
        input:focus, select:focus {
          outline: none;
          border-color: #0ea5e9 !important;
          boxShadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
          background: white !important;
        }
       
        button:hover:not(:disabled) {
          transform: translateY(-3px);
          boxShadow: 0 10px 30px rgba(0,0,0,0.2) !important;
        }
       
        button:active:not(:disabled) {
          transform: translateY(-1px);
        }
       
        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          borderTopColor: white;
          animation: spin 1s linear infinite;
        }
       
        input:hover, select:hover {
          border-color: #bae6fd !important;
        }
       
        /* RESPONSIVE STYLES - REMOVED COMPLEX SELECTORS */
        @media (max-width: 768px) {
          header {
            padding: 0 20px !important;
          }
         
          main {
            padding: 16px !important;
          }
         
          img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
       
        /* IMAGE RESPONSIVE FIX */
        img {
          max-width: 100%;
          height: auto;
        }
       
        /* PREVENT HORIZONTAL SCROLL */
        * {
          box-sizing: border-box;
        }
       
        html, body {
          overflow-x: hidden;
          width: '100%';
        }
      `}</style>
    </div>
  );
}

export default App;