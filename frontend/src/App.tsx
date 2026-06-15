import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Key, 
  Download, 
  RefreshCw, 
  Upload, 
  Trash2, 
  Lock, 
  Unlock, 
  Sparkles, 
  AlertTriangle,
  FileImage,
  Info,
  Copy,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

import { ImageSlider } from './components/ImageSlider';
import { SecurityDashboard } from './components/SecurityDashboard';
import { TerminalLog } from './components/TerminalLog';
import type { LogEntry } from './components/TerminalLog';

function App() {
  // Image states
  const [originalImage, setOriginalImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  
  const [encryptedImage, setEncryptedImage] = useState<string>('');
  const [decryptedImage, setDecryptedImage] = useState<string>('');
  
  // Encryption parameters
  const [key, setKey] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<string>('xor');
  
  // UX states
  const [activeMode, setActiveMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [engineOnline, setEngineOnline] = useState<boolean>(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Custom UX States for user-friendliness
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showManual, setShowManual] = useState<boolean>(false);
  
  // Terminal log state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to add system log entry
  const addLog = (source: LogEntry['source'], message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, source, message, type }]);
  };

  // Perform backend health check on mount
  useEffect(() => {
    addLog('SYSTEM', 'Initializing cryptographic deck console...', 'info');
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setEngineOnline(true);
        addLog('SYSTEM', `Secure link established with Python Engine: ${data.engine}`, 'success');
      })
      .catch(() => {
        setEngineOnline(false);
        addLog('SYSTEM', 'Link failure: Encryption backend offline. Please boot flask server.', 'error');
      });
  }, []);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Process uploaded image file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addLog('SECURITY', `Reject upload: ${file.name} is not a valid image format.`, 'error');
      alert('Error: File must be an image.');
      return;
    }

    const sizeKB = (file.size / 1024).toFixed(2);
    setFileName(file.name);
    setFileSizeStr(`${sizeKB} KB`);
    
    addLog('USER', `Queued file: "${file.name}" [${sizeKB} KB]`, 'info');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const base64Str = event.target.result;
        setOriginalImage(base64Str);
        
        // Reset output states when a new image is loaded
        setEncryptedImage('');
        setDecryptedImage('');
        setProcessingTime(0);
        
        // Retrieve resolution
        const img = new Image();
        img.onload = () => {
          setResolution(`${img.width} x ${img.height}`);
          addLog('ENGINE', `Render complete. Buffer dims: ${img.width}x${img.height}`, 'success');
        };
        img.src = base64Str;
      }
    };
    reader.onerror = () => {
      addLog('ENGINE', 'Buffer reading failure', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Generate a random high-entropy encryption key
  const handleGenerateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let randomKey = '';
    const length = 16;
    for (let i = 0; i < length; i++) {
      randomKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setKey(randomKey);
    addLog('SECURITY', `Generated random 128-bit symmetric key.`, 'success');
  };

  // Copy key to clipboard
  const handleCopyKey = () => {
    if (!key) return;
    navigator.clipboard.writeText(key)
      .then(() => {
        setCopied(true);
        addLog('SECURITY', 'Symmetric key copied to clipboard.', 'success');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        addLog('SYSTEM', 'Copy failed. Please copy manually.', 'error');
      });
  };

  // Trigger base64 image download
  const downloadImage = (base64Data: string, prefix: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    // Encrypted images are always PNG format to preserve lossless pixel channels
    const ext = prefix === 'encrypted' ? 'png' : (fileName.split('.').pop() || 'png');
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || 'image';
    link.download = `${baseName}_${prefix}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('USER', `Downloaded: ${baseName}_${prefix}.${ext}`, 'success');
  };

  // Clear workspace
  const handleClear = () => {
    setOriginalImage('');
    setFileName('');
    setFileSizeStr('');
    setResolution('');
    setEncryptedImage('');
    setDecryptedImage('');
    setProcessingTime(0);
    setKey('');
    addLog('SYSTEM', 'Workspace buffer cleared.', 'warning');
  };

  // Trigger image encryption via backend
  const handleEncrypt = async () => {
    if (!originalImage) {
      addLog('SECURITY', 'Encryption rejected: No image selected.', 'warning');
      return;
    }
    if (!key) {
      addLog('SECURITY', 'Encryption rejected: Passphrase key is empty.', 'warning');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    addLog('ENGINE', `Running ${algorithm.toUpperCase()} pixel encrypt engine...`, 'info');

    try {
      const response = await fetch('/api/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: originalImage,
          key: key,
          algorithm: algorithm
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server processing error.');
      }

      setEncryptedImage(data.image);
      setDecryptedImage(''); // Clear previous decryption
      setProcessingTime(data.analytics.processingTimeMs);
      
      const sizeDiff = (data.analytics.encryptedSize / 1024).toFixed(2);
      addLog('ENGINE', `Cipher success in ${data.analytics.processingTimeMs}ms. Encrypted size: ${sizeDiff} KB`, 'success');
      addLog('SECURITY', `Cipher integrity checksum verified. Ready for deployment.`, 'success');
      setActiveMode('decrypt'); // Auto pivot to decrypt view
    } catch (err: any) {
      const errMsg = err.message || 'Connection lost to encryption server.';
      setErrorMessage(errMsg);
      addLog('SECURITY', `Encryption failed: ${errMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger image decryption via backend
  const handleDecrypt = async () => {
    const targetImage = encryptedImage || originalImage;
    if (!targetImage) {
      addLog('SECURITY', 'Decryption rejected: No source cipher found.', 'warning');
      return;
    }
    if (!key) {
      addLog('SECURITY', 'Decryption rejected: Key is empty.', 'warning');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    addLog('ENGINE', `Decrypting with ${algorithm.toUpperCase()} core...`, 'info');

    try {
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetImage,
          key: key,
          algorithm: algorithm
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server processing error.');
      }

      setDecryptedImage(data.image);
      setProcessingTime(data.analytics.processingTimeMs);
      addLog('ENGINE', `Decryption verified in ${data.analytics.processingTimeMs}ms. Perfect pixel recreation.`, 'success');
    } catch (err: any) {
      const errMsg = err.message || 'Connection lost to decryption server.';
      setErrorMessage(errMsg);
      addLog('SECURITY', `Decryption failed: ${errMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid py-6 px-4 md:px-8 text-slate-100 flex flex-col justify-between">
      
      {/* 1. Header Section */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center border-b border-cyber-border pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyber-cyan/15 rounded border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-black tracking-widest text-white neon-text-cyan">
                PIXELCRYPT
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-cyber-purple font-semibold">
                ADVANCED IMAGE ENCRYPTION SUITE
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyber-dark border border-cyber-border rounded font-mono text-xs">
          <span className="text-zinc-500">DECK CONNECTION:</span>
          <span className={`flex items-center gap-1.5 font-bold ${engineOnline ? 'text-cyber-green' : 'text-cyber-red animate-pulse'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${engineOnline ? 'bg-cyber-green animate-ping' : 'bg-cyber-red'}`} />
            {engineOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          {!engineOnline && (
            <button 
              onClick={() => {
                fetch('/api/health')
                  .then(r => r.json())
                  .then(() => setEngineOnline(true))
                  .catch(() => {});
              }}
              className="ml-2 hover:text-cyber-cyan transition-colors"
              title="Retry link"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Workstation Panel */}
      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Side: Controls (5 columns) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Encryption Controls Panel */}
          <div className="cyber-panel p-5 rounded-lg flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
                <span className="font-mono text-xs text-cyber-cyan tracking-widest uppercase font-semibold">CIPHER CORE CONSOLE</span>
                <span className="text-[10px] font-mono text-zinc-500">V1.0-A</span>
              </div>

              {/* Mode Selector Tab */}
              <div className="flex border border-cyber-border rounded overflow-hidden p-1 bg-cyber-dark/40">
                <button
                  onClick={() => setActiveMode('encrypt')}
                  className={`flex-1 py-1.5 font-mono text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    activeMode === 'encrypt'
                      ? 'bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan rounded shadow-inner font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  ENCRYPT ENGINE
                </button>
                <button
                  onClick={() => setActiveMode('decrypt')}
                  className={`flex-1 py-1.5 font-mono text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    activeMode === 'decrypt'
                      ? 'bg-cyber-purple/15 border border-cyber-purple/30 text-cyber-purple rounded shadow-inner font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  DECRYPT ENGINE
                </button>
              </div>

              {/* Algorithm choice */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 tracking-wider mb-2 uppercase">
                  CRYPTOGRAPHIC ALGORITHM
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'xor', name: 'XOR Byte' },
                    { id: 'shuffle', name: 'Shuffle' },
                    { id: 'hybrid', name: 'Hybrid' }
                  ].map((alg) => (
                    <button
                      key={alg.id}
                      onClick={() => {
                        setAlgorithm(alg.id);
                        addLog('SYSTEM', `Encryption method set to ${alg.name.toUpperCase()}`, 'info');
                      }}
                      className={`py-2 text-xs font-mono border rounded tracking-wide transition-all ${
                        algorithm === alg.id
                          ? 'border-cyber-cyan bg-cyber-cyan/5 text-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.15)] font-medium'
                          : 'border-cyber-border bg-cyber-dark/30 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {alg.name}
                    </button>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-cyber-dark/60 border border-cyber-border/40 rounded font-mono text-[10px] text-zinc-400 leading-4">
                  {algorithm === 'xor' && (
                    <p><span className="text-cyber-cyan font-bold">XOR BYTE:</span> Obfuscates color values pixel-by-pixel. Extremely fast; shatters colors while keeping structural boundaries recognizable.</p>
                  )}
                  {algorithm === 'shuffle' && (
                    <p><span className="text-cyber-cyan font-bold">SHUFFLE:</span> Scrambles pixel locations spatially. The color profile remains identical, but the layout is completely randomized.</p>
                  )}
                  {algorithm === 'hybrid' && (
                    <p><span className="text-cyber-cyan font-bold">HYBRID CORE:</span> Spatial pixel shuffling followed by secondary derived XOR color shifting. Recommended for maximum encryption strength.</p>
                  )}
                </div>
              </div>

              {/* Key Phrase Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase">
                    SYMMETRIC PASSPHRASE KEY
                  </label>
                  <button
                    onClick={handleGenerateKey}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyber-cyan hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter decryption/encryption key"
                    className="w-full pl-10 pr-20 py-2 text-sm cyber-input font-mono rounded border"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {key && (
                      <button
                        onClick={handleCopyKey}
                        className={`p-1 rounded transition-colors text-xs font-mono flex items-center justify-center ${copied ? 'text-cyber-green' : 'text-zinc-500 hover:text-white'}`}
                        title="Copy key"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
                      title={showKey ? "Hide key" : "Show key"}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatting Alert Warning */}
              <div className="bg-cyber-yellow/5 border border-cyber-yellow/20 p-3 rounded flex gap-2 text-xs font-mono text-cyber-yellow/85">
                <Info className="w-4 h-4 text-cyber-yellow flex-shrink-0 mt-0.5" />
                <p className="leading-5">
                  <span className="font-bold">FORMAT PROTOCOL:</span> Encryption processes pixels deterministically. Ciphers are compiled as lossless <span className="underline">PNG</span> to prevent block distortion.
                </p>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-cyber-red/10 border border-cyber-red/30 rounded text-xs font-mono text-cyber-red flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Triggers */}
            <div className="mt-6 flex gap-3">
              {originalImage && (
                <button
                  onClick={handleClear}
                  className="px-3 border border-cyber-red/40 hover:bg-cyber-red/10 text-cyber-red hover:text-white transition-colors rounded flex items-center justify-center"
                  title="Clear current workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {activeMode === 'encrypt' ? (
                <button
                  onClick={handleEncrypt}
                  disabled={isLoading || !originalImage || !key || !engineOnline}
                  className="flex-1 py-3 text-sm font-mono tracking-widest font-bold bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 rounded cursor-pointer"
                  style={{ clipPath: 'polygon(0 0, 94% 0, 100% 8px, 100% 100%, 6% 100%, 0 92%)' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      ENCRYPTING PIXELS...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      RUN ENCRYPT CIPHER
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDecrypt}
                  disabled={isLoading || (!encryptedImage && !originalImage) || !key || !engineOnline}
                  className="flex-1 py-3 text-sm font-mono tracking-widest font-bold bg-cyber-purple hover:bg-purple-500 text-white transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(189,0,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 rounded cursor-pointer"
                  style={{ clipPath: 'polygon(0 0, 94% 0, 100% 8px, 100% 100%, 6% 100%, 0 92%)' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      DECRYPTING PIXELS...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      RUN DECRYPT CIPHER
                    </>
                  )}
                </button>
              )}
             </div>
          </div>

          {/* Collapsible Operations Manual */}
          <div className="cyber-panel p-4 rounded-lg">
            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full flex items-center justify-between font-mono text-xs text-cyber-cyan tracking-widest uppercase font-semibold hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-cyber-cyan" />
                <span>OPERATIONS MANUAL</span>
              </div>
              {showManual ? <ChevronUp className="w-4 h-4 text-cyber-cyan" /> : <ChevronDown className="w-4 h-4 text-cyber-cyan" />}
            </button>
            
            {showManual && (
              <div className="mt-3 border-t border-cyber-border/40 pt-3 font-mono text-[11px] text-zinc-400 space-y-2.5 leading-relaxed">
                <div>
                  <span className="text-white font-bold block mb-0.5">1. QUEUE A FILE</span>
                  Drag & drop any image file (PNG, JPG, WEBP) into the comparative viewer.
                </div>
                <div>
                  <span className="text-white font-bold block mb-0.5">2. SYMMETRIC PASSPHRASE</span>
                  Enter a secret passphrase key or click "Auto-Generate". You will need this exact key to decrypt it later!
                </div>
                <div>
                  <span className="text-white font-bold block mb-0.5">3. ENCRYPTION PROTOCOL</span>
                  Select an algorithm and click "RUN ENCRYPT CIPHER". Review the side-by-side cipher.
                </div>
                <div>
                  <span className="text-white font-bold block mb-0.5">4. EXPORT & DECRYPT</span>
                  Download the lossless PNG. To decrypt, choose "DECRYPT ENGINE", enter the identical key and algorithm, and run decrypt.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Workspace Viewport (7 columns) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="cyber-panel p-5 rounded-lg flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-cyber-border pb-2.5 mb-4">
              <span className="font-mono text-xs text-cyber-cyan tracking-widest uppercase font-semibold">IMAGE COMPARISON VIEWER</span>
              <div className="flex items-center gap-2">
                {fileName && (
                  <span className="text-[10px] font-mono text-zinc-400 bg-cyber-dark border border-cyber-border px-2 py-0.5 rounded">
                    {fileName} ({resolution})
                  </span>
                )}
              </div>
            </div>

            {/* Viewport Core Content */}
            <div className="flex-1 flex flex-col justify-center items-center">
              {!originalImage ? (
                /* Drag & Drop Upload Zone */
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`w-full max-w-lg aspect-video md:aspect-[16/10] border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer text-center select-none ${
                    isDragging 
                      ? 'border-cyber-cyan bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,240,255,0.15)] scale-[0.99]' 
                      : 'border-cyber-border bg-cyber-dark/40 hover:border-cyber-border-glow hover:bg-cyber-cyan/2'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div className="p-4 bg-cyber-dark border border-cyber-border rounded-full text-zinc-400 mb-4 transition-transform group-hover:scale-110 shadow-lg">
                    <Upload className="w-8 h-8 text-cyber-cyan" />
                  </div>
                  <h3 className="text-white font-mono text-sm tracking-wider mb-1 font-bold">
                    DRAG & DROP IMAGE FILE
                  </h3>
                  <p className="text-zinc-500 text-xs font-mono mb-4">
                    Supports PNG, JPG, JPEG, WEBP
                  </p>
                  <button className="px-4 py-2 border border-cyber-cyan/30 hover:border-cyber-cyan bg-cyber-cyan/5 hover:bg-cyber-cyan/10 text-cyber-cyan font-mono text-xs rounded transition-all uppercase tracking-widest font-semibold active:scale-95">
                    Browse File Directory
                  </button>
                </div>
              ) : (
                /* Image Comparison Display */
                <div className="w-full flex flex-col gap-4">
                  {/* Slider comparison */}
                  {!encryptedImage && !decryptedImage ? (
                    /* Only original image uploaded */
                    <div className="relative w-full aspect-video md:aspect-[16/10] bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 left-3 bg-cyber-dark/85 border border-cyber-cyan/30 px-3 py-1 text-xs font-mono text-cyber-cyan tracking-wider flex items-center gap-1.5 backdrop-blur-md rounded">
                        <FileImage className="w-3.5 h-3.5" />
                        QUEUED SOURCE FILE
                      </div>
                    </div>
                  ) : decryptedImage ? (
                    /* Show decryption comparison */
                    <ImageSlider 
                      original={encryptedImage || originalImage} 
                      processed={decryptedImage} 
                      originalLabel="ENCRYPTED CIPHER"
                      processedLabel="DECRYPTED PLAIN"
                    />
                  ) : (
                    /* Show encryption comparison */
                    <ImageSlider 
                      original={originalImage} 
                      processed={encryptedImage} 
                      originalLabel="SOURCE IMAGE"
                      processedLabel="ENCRYPTED CIPHER"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Download/Export Panel */}
            {originalImage && (
              <div className="mt-4 pt-4 border-t border-cyber-border/40 flex justify-between gap-3">
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <FileImage className="w-3 h-3" />
                  Buffer size: {fileSizeStr}
                </span>
                
                <div className="flex gap-2">
                  {encryptedImage && (
                    <button
                      onClick={() => downloadImage(encryptedImage, 'encrypted')}
                      className="flex items-center gap-1.5 text-xs font-mono text-cyber-cyan hover:text-white border border-cyber-cyan/30 px-3 py-1.5 rounded bg-cyber-cyan/5 hover:bg-cyber-cyan/15 transition-all cursor-pointer active:scale-95 pulse-glowing-cyan"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Cipher
                    </button>
                  )}
                  {decryptedImage && (
                    <button
                      onClick={() => downloadImage(decryptedImage, 'decrypted')}
                      className="flex items-center gap-1.5 text-xs font-mono text-cyber-green hover:text-white border border-cyber-green/30 px-3 py-1.5 rounded bg-cyber-green/5 hover:bg-cyber-green/15 transition-all cursor-pointer active:scale-95 pulse-glowing-green"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Decrypted
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. Bottom Panels: Analytics Dashboard & Logs */}
      <section className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SecurityDashboard 
          imageSize={fileSizeStr}
          resolution={resolution}
          processingTime={processingTime}
          encryptionKey={key}
          engineOnline={engineOnline}
          algorithm={algorithm}
        />
        <TerminalLog 
          logs={logs} 
          onClear={() => {
            setLogs([]);
          }}
        />
      </section>

      {/* 4. Footer Section */}
      <footer className="max-w-7xl mx-auto w-full border-t border-cyber-border/60 pt-6 mt-4 pb-2 text-center font-mono text-xs text-zinc-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="tracking-wide">
            Created by <span className="text-cyber-cyan font-bold hover:neon-text-cyan transition-all">Aathekesavan R</span> | <span className="text-zinc-400">Cyber Security Internship</span> | <span className="text-cyber-purple font-semibold">Prodigy InfoTech</span>
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/aathekesavan" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-cyber-cyan transition-colors"
            >
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </a>
            <span className="text-zinc-700">|</span>
            <a 
              href="https://www.linkedin.com/in/aathekesavan-r-a37a84316" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-cyber-purple transition-colors"
            >
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
