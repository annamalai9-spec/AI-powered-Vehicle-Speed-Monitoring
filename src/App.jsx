import React, { useState } from 'react';
import { Linkedin, Twitter, Instagram, Youtube, Play, ShieldCheck, Activity, Download, CheckCircle } from 'lucide-react';
import './App.css';

const VSMSPlatform = () => {
  const [video, setVideo] = useState(null);
  const [distance, setDistance] = useState('');
  const [direction, setDirection] = useState(''); // Empty by default
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const API_URL = "https://chalazal-nonrepressibly-dante.ngrok-free.dev";

  const handleSubmit = async () => {
    if (!video || !distance || !direction) {
      alert("Please provide all required inputs (video, distance, and direction).");
      return;
    }

    const maxSize = 1024 * 1024 * 1024;
    if (video.size > maxSize) {
      alert(`❌ Video file is too large! Maximum size: 1GB\nYour file: ${(video.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    const fileSizeMB = video.size / (1024 * 1024);
    if (fileSizeMB > 500) {
      setProgress('Large file detected! Uploading may take 3-5 minutes...');
    } else {
      setProgress('Uploading video to T4 GPU...');
    }

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('distance', distance);
      formData.append('direction', direction);

      setProgress('Processing on T4 GPU... This may take 5-15 minutes...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 900000);

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      setProgress('Downloading results...');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setProgress('');
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `vsms_results_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert('✅ Analysis complete! ZIP file downloaded automatically.');

    } catch (err) {
      console.error('Error:', err);
      if (err.name === 'AbortError') {
        setError('Request timeout (15 min). Try a shorter video.');
      } else {
        setError(err.message);
      }
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vsms-root">
      <nav className="navbar">
        <div className="logo-container">
          <img src="/COERS.png" alt="COERS Logo" />
          <img src="/RBG.png" alt="RBG Logo" />
        </div>
        <div className="nav-branding">
          <div className="gov-tag">IIT MADRAS RESEARCH</div>
          <div className="coers-title">Centre of Excellence for Road Safety</div>
        </div>
      </nav>

      <main className="compact-container">
        
        <section className="info-panel">
          <div className="hero-compact">
            <h1>Vehicle Speed Monitoring <span className="text-gradient">AI System</span></h1>
            <p>Advanced computer vision framework for highway safety enforcement and standardized traffic data acquisition.</p>
          </div>

          <div className="info-grid">
            <div className="info-box">
              <ShieldCheck size={20} />
              <div>
                <h4>Mission</h4>
                <p>MoRTH-designed system for automated speed enforcement on National Highways</p>
              </div>
            </div>
            
            <div className="info-box">
              <Activity size={20} />
              <div>
                <h4>Capabilities</h4>
                <p>Real-time tracking, violation detection, vehicle classification, report generation</p>
              </div>
            </div>
          </div>

          {downloadUrl && (
            <div className="success-compact">
              <CheckCircle size={18} />
              <span>Analysis Complete! ZIP includes 3 Excel + 3 PNG + Video</span>
              <button className="download-mini" onClick={() => {
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `vsms_results_${Date.now()}.zip`;
                a.click();
              }}>
                <Download size={16} /> Redownload
              </button>
            </div>
          )}
        </section>

        <aside className="terminal-compact">
          <h2>Analysis Terminal</h2>

          <div className="input-compact">
            <label>1. VIDEO</label>
            <input 
              type="file" 
              accept="video/*" 
              onChange={(e) => setVideo(e.target.files[0])}
              disabled={loading}
            />
            {video && (
              <span className="file-info">✓ {video.name} ({(video.size / 1024 / 1024).toFixed(0)}MB)</span>
            )}
          </div>

          <div className="input-compact">
            <label>2. DIRECTION</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} disabled={loading}>
              <option value="">-- Select Traffic Direction --</option>
              <option value="DOWNWARD">Downward Traffic</option>
              <option value="UPWARD">Upward Traffic</option>
              <option value="BIDIRECTIONAL">Bidirectional</option>
            </select>
          </div>

          <div className="input-compact">
            <label>3. DISTANCE (meters)</label>
            <input 
              type="number" 
              placeholder="e.g. 10" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)}
              disabled={loading}
            />
          </div>

          {progress && (
            <div className="progress-compact">
              <div className="spinner-small"></div>
              <span>{progress}</span>
            </div>
          )}

          {error && <div className="error-compact">❌ {error}</div>}

          <button className="analyze-btn-compact" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                PROCESSING...
              </>
            ) : (
              <>
                <Play size={16} fill="white" /> START ANALYSIS
              </>
            )}
          </button>
        </aside>
      </main>

      <footer className="footer-compact">
        <div className="social-compact">
          <a href="https://www.linkedin.com/company/coers/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
            <Linkedin size={16} />
          </a>
          <a href="https://x.com/CoERS_IITM" target="_blank" rel="noopener noreferrer">
            <Twitter size={16} />
          </a>
          <a href="https://www.instagram.com/coers_iitm/?hl=en" target="_blank" rel="noopener noreferrer">
            <Instagram size={16} />
          </a>
          <a href="https://www.youtube.com/@rbg4rbg/videos" target="_blank" rel="noopener noreferrer">
            <Youtube size={16} />
          </a>
        </div>
        <p>Advanced Transport Analytics • RBG Group Research • IIT Madras</p>
      </footer>
    </div>
  );
};

export default VSMSPlatform;