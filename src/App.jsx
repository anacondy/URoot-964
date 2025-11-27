import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Terminal, MoveRight, Layers, Cpu, Radio, Disc, Upload, Play, Pause, Shield, ShieldAlert, FileCode, RotateCcw, FilePlus, Save, X, Edit, Music, Video, Image as ImageIcon, FileText, Package, AlertTriangle } from 'lucide-react';

/* --- SOUND ENGINE (Web Audio API) --- 
   Refined for subtle, tactical audio feedback.
*/
const SoundFX = {
  ctx: null,
  init: () => {
    if (!SoundFX.ctx) {
      SoundFX.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playClick: () => {
    if (!SoundFX.ctx) SoundFX.init();
    const t = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    
    // Short, high-tech blip (Sine wave)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    
    // Very short envelope
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  },
  playHover: () => {
    if (!SoundFX.ctx) SoundFX.init();
    const t = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.03);
    
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  },
  playBoot: () => {
    if (!SoundFX.ctx) SoundFX.init();
    const t = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.4);
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  },
  playKeystroke: () => {
    if (!SoundFX.ctx) SoundFX.init();
    const t = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    gain.gain.setValueAtTime(0.005, t); // Very quiet
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  }
};

/* FONTS & GLOBAL STYLES */
const Fonts = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Noto+Sans+JP:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
    
    :root {
      --acid-green: #d4ff00;
      --deep-black: #080808;
      --off-black: #111111;
      --scan-line-color: rgba(212, 255, 0, 0.05);
    }

    body {
      background-color: var(--deep-black);
      color: var(--acid-green);
      font-family: 'Space Mono', monospace;
      overflow-x: hidden;
      cursor: crosshair;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--deep-black); }
    ::-webkit-scrollbar-thumb { background: var(--acid-green); border-radius: 0px; }

    /* Utilities */
    .font-poster { font-family: 'Archivo Black', sans-serif; }
    .font-jp { font-family: 'Noto Sans JP', sans-serif; }
    .text-acid { color: var(--acid-green); }
    .bg-acid { background-color: var(--acid-green); }
    .border-acid { border-color: var(--acid-green); }
    
    /* Input Placeholders */
    textarea::placeholder, input::placeholder {
      color: rgba(212, 255, 0, 0.2);
      font-style: italic;
      letter-spacing: 1px;
    }

    /* CRT/Grain Effects */
    .noise-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 50;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .scanlines {
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.2) 50%,
        rgba(0,0,0,0.2)
      );
      background-size: 100% 4px;
      position: fixed;
      top: 0; right: 0; bottom: 0; left: 0;
      z-index: 51;
      pointer-events: none;
      opacity: 0.6;
    }

    /* Glitch Animation Keyframes */
    @keyframes glitch-anim-1 {
      0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
      20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
      40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
      60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
      80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
      100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
    }

    .glitch-hover:hover {
      animation: glitch-anim-1 0.3s infinite linear alternate-reverse;
      text-shadow: 2px 0 red, -2px 0 blue;
    }
    
    .poster-image-container {
      position: relative;
      background-color: var(--acid-green);
    }
    .poster-image-container img {
      mix-blend-mode: multiply;
      opacity: 0.9;
      filter: grayscale(100%) contrast(200%);
    }

    .page-transition {
      animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    .vertical-text {
      writing-mode: vertical-rl;
      text-orientation: upright;
      letter-spacing: 0.2em;
    }
  `}} />
);

/* COMPONENTS */

const useSystemMonitor = () => {
  const [stats, setStats] = useState({ cpu: 0, mem: 0, net: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      const perf = window.performance;
      let memUsage = 0;
      if (perf && perf.memory) {
        memUsage = Math.round((perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100);
      } else {
        memUsage = 20 + Math.floor(Math.random() * 20);
      }
      setStats({
        cpu: Math.max(5, Math.min(100, Math.floor(30 + Math.sin(Date.now() / 2000) * 20 + Math.random() * 15))),
        mem: memUsage,
        net: (Math.random() * 5.5).toFixed(1)
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  return stats;
};

const HeroImage = () => (
  <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden poster-image-container">
    <div className="absolute inset-0 bg-black mix-blend-multiply z-10"></div>
    <img 
      src="https://images.unsplash.com/photo-1618609378039-b572f64c5b42?q=80&w=1000&auto=format&fit=crop" 
      alt="Distorted Figure"
      className="w-full h-full object-cover object-center scale-110"
    />
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZDRmZjAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50 z-20 pointer-events-none"></div>
  </div>
);

/* --- CUSTOM MEDIA PLAYERS --- */

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    SoundFX.playClick();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative group">
      <video 
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="text-[var(--acid-green)] hover:text-white transition-colors">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <div className="flex-1 h-1 bg-gray-800 relative cursor-pointer" onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             videoRef.current.currentTime = pos * videoRef.current.duration;
          }}>
             <div className="absolute top-0 left-0 h-full bg-[var(--acid-green)]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = ({ src, fileName }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    SoundFX.playClick();
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/40">
       <div className="w-48 h-48 border-2 border-[var(--acid-green)] rounded-full flex items-center justify-center mb-8 relative">
          <div className={`absolute inset-0 border-2 border-[var(--acid-green)] rounded-full opacity-50 ${isPlaying ? 'animate-ping' : ''}`}></div>
          <Disc size={64} className={isPlaying ? 'animate-spin-slow' : ''} />
       </div>
       <h3 className="font-poster text-xl mb-4 tracking-widest text-center break-all">{fileName}</h3>
       <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
       
       <button 
         onClick={togglePlay} 
         className="w-16 h-16 rounded-full border border-[var(--acid-green)] flex items-center justify-center hover:bg-[var(--acid-green)] hover:text-black transition-all"
       >
         {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
       </button>
    </div>
  );
};

/* --- UNIVERSAL FILE VIEWER --- */

const UniversalViewer = ({ fileType, fileUrl, fileContent, isSandbox, fileName, iframeRef, textareaRef, isEditing, editorContent, setEditorContent }) => {
  
  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className="w-full h-full bg-transparent text-[var(--acid-green)] p-4 font-mono text-sm resize-none focus:outline-none"
        value={editorContent}
        onChange={(e) => { setEditorContent(e.target.value); SoundFX.playKeystroke(); }}
        spellCheck="false"
        placeholder="// ENTER CODE HERE..."
      />
    );
  }

  switch (fileType) {
    case 'image':
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/50 overflow-auto">
          <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      );
    case 'video':
      return <VideoPlayer src={fileUrl} />;
    case 'audio':
      return <AudioPlayer src={fileUrl} fileName={fileName} />;
    case 'pdf':
      return (
        <iframe src={fileUrl} className="w-full h-full border-none" title="PDF Preview" />
      );
    case 'code':
    case 'text':
      return (
        <iframe 
             ref={iframeRef}
             title="Preview"
             className="w-full h-full border-none"
             sandbox={isSandbox ? "allow-scripts" : "allow-scripts allow-same-origin allow-forms allow-popups allow-modals"}
        />
      );
    case 'archive':
    case 'executable':
    case 'unknown':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
           <Package size={64} className="mb-4 text-[var(--acid-green)] opacity-50" />
           <p className="font-poster text-xl mb-2">BINARY PREVIEW NOT AVAILABLE</p>
           <div className="font-mono text-xs text-left p-4 border border-[var(--acid-green)] bg-black/50 w-64 h-32 overflow-hidden opacity-50">
              0F 2A 4C 99 1B ... <br/>
              SYSTEM: FILE_RECOGNIZED <br/>
              TYPE: {fileName?.split('.').pop()?.toUpperCase()} <br/>
              SIZE: [LOADED]
           </div>
        </div>
      );
    default:
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
            <Disc className="animate-spin-slow mb-2" />
            <span className="text-xs tracking-widest">WAITING FOR INPUT STREAM...</span>
        </div>
      );
  }
};

/* --- DASHBOARD LOGIC --- */

const CodeRunner = () => {
  const [fileContent, setFileContent] = useState(null); // Raw text content for code
  const [fileUrl, setFileUrl] = useState(null); // Blob URL for media
  const [fileType, setFileType] = useState(null); // 'image', 'video', 'code', etc.
  
  const [editorContent, setEditorContent] = useState('');
  const [fileName, setFileName] = useState(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const getFileType = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'ico'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) return 'audio';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'iso'].includes(ext)) return 'archive';
    if (['exe', 'msi', 'bat', 'apk'].includes(ext)) return 'executable';
    if (['js', 'jsx', 'html', 'css', 'py', 'json', 'txt', 'cpp', 'java', 'sql'].includes(ext)) return 'code';
    return 'unknown';
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      SoundFX.playClick();
      setFileName(file.name);
      const type = getFileType(file.name);
      setFileType(type);
      setIsEditing(false);

      // Create Blob URL for media rendering
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);

      // Read text content only if it's code/text
      if (type === 'code') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target.result);
        };
        reader.readAsText(file);
      } else {
        setFileContent(null);
      }
    }
  };

  const handleCreateFile = () => {
    SoundFX.playClick();
    setFileName('new_module.js');
    setFileType('code');
    setEditorContent('');
    setIsEditing(true);
  };

  const handleEdit = () => {
    SoundFX.playClick();
    if (fileType === 'code') {
       setEditorContent(fileContent || '');
       setIsEditing(true);
    }
  };

  const handleSaveCommit = () => {
    SoundFX.playClick();
    setFileContent(editorContent);
    setIsEditing(false);
  };

  const executeCode = () => {
    SoundFX.playClick();
    // Only applies to code types
    if (fileType !== 'code' || !iframeRef.current) return;

    let injectedCode = fileContent;
    const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'js';

    // DIRECT HTML INJECTION (Fixes the simple html file issue)
    if (ext === 'html') {
       const blob = new Blob([injectedCode], { type: 'text/html' });
       iframeRef.current.src = URL.createObjectURL(blob);
       return;
    }

    // JSX/JS WRAPPER
    if (['js', 'jsx'].includes(ext)) {
       injectedCode = `
         <html>
           <head>
             <style>body { color: #d4ff00; background: #000; font-family: monospace; padding: 20px; font-size: 14px; margin: 0; }</style>
             <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
           </head>
           <body>
             <div id="root"></div>
             <script type="text/babel">
               const originalLog = console.log;
               console.log = (...args) => {
                 const logElem = document.createElement('div');
                 logElem.textContent = '> ' + args.join(' ');
                 logElem.style.opacity = '0.8';
                 logElem.style.marginBottom = '4px';
                 logElem.style.borderLeft = '2px solid #d4ff00';
                 logElem.style.paddingLeft = '8px';
                 document.body.appendChild(logElem);
                 originalLog(...args);
               };
               try {
                 ${fileContent}
               } catch (err) {
                 document.body.innerHTML += '<div style="color:red; margin-top:10px;">ERROR: ' + err.message + '</div>';
               }
             </script>
           </body>
         </html>
       `;
       const blob = new Blob([injectedCode], { type: 'text/html' });
       iframeRef.current.src = URL.createObjectURL(blob);
    } 
    // PLAIN TEXT / OTHER CODE
    else {
        const blob = new Blob([`<style>body{background:#000;color:#d4ff00;white-space:pre;font-family:monospace;}</style><pre>${fileContent}</pre>`], { type: 'text/html' });
        iframeRef.current.src = URL.createObjectURL(blob);
    }
  };

  const reset = () => {
    SoundFX.playClick();
    setFileContent('');
    setFileUrl(null);
    setFileName(null);
    setFileType(null);
    setIsEditing(false);
    if (iframeRef.current) iframeRef.current.src = 'about:blank';
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Execute automatically if switching back from edit mode or loading a code file initially?
  // User asked for "Execute" button, so we keep manual trigger for code.
  // But media should auto-play/show.

  return (
    <div className="flex flex-col h-full border border-[var(--acid-green)] bg-black/40 backdrop-blur-sm p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-[var(--acid-green)] border-opacity-30 pb-2">
        <div className="flex items-center gap-2 max-w-[50%]">
          {fileType === 'video' ? <Video size={18} /> : 
           fileType === 'audio' ? <Music size={18} /> :
           fileType === 'image' ? <ImageIcon size={18} /> :
           <FileCode size={18} />}
          <span className="font-poster tracking-wider text-sm truncate">{fileName || 'NO_SOURCE_LOADED'}</span>
          
          {fileType === 'code' && !isEditing && (
             <button onClick={handleEdit} className="ml-2 opacity-50 hover:opacity-100" title="Edit Source">
                <Edit size={14} />
             </button>
          )}
        </div>
        
        {/* Sandbox Toggle */}
        <div className="flex items-center gap-4">
           {fileType === 'code' && (
             <div 
               className="flex items-center gap-2 cursor-pointer group"
               onClick={() => { SoundFX.playClick(); setIsSandbox(!isSandbox); }}
             >
               <span className={`text-[10px] font-mono transition-colors ${isSandbox ? 'text-[var(--acid-green)]' : 'text-red-500'}`}>
                 {isSandbox ? 'SANDBOX: ACTIVE' : 'SANDBOX: OFF'}
               </span>
               {isSandbox ? <Shield size={14} /> : <ShieldAlert size={14} className="text-red-500 animate-pulse" />}
             </div>
           )}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-black/80 border border-[var(--acid-green)] border-opacity-20 mb-4 overflow-hidden">
        <UniversalViewer 
           fileType={fileType}
           fileUrl={fileUrl}
           fileContent={fileContent}
           isSandbox={isSandbox}
           fileName={fileName}
           iframeRef={iframeRef}
           textareaRef={textareaRef}
           isEditing={isEditing}
           editorContent={editorContent}
           setEditorContent={setEditorContent}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        
        {isEditing ? (
          <>
            <button 
              onClick={handleSaveCommit}
              className="flex-1 border border-[var(--acid-green)] bg-[var(--acid-green)] text-black py-3 text-sm font-bold tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              onMouseEnter={SoundFX.playHover}
            >
              <Save size={16} />
              COMMIT_CHANGES
            </button>
            <button 
              onClick={() => { SoundFX.playClick(); setIsEditing(false); }}
              className="px-6 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black py-3 text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
              onMouseEnter={SoundFX.playHover}
            >
              <X size={16} />
              CANCEL
            </button>
          </>
        ) : (
          <>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
              // Accepting wide range of files as requested
              accept=".html,.js,.jsx,.txt,.css,.py,.json,.cpp,.java,.sql,.jpg,.jpeg,.png,.webp,.svg,.gif,.mp4,.mkv,.mov,.avi,.mp3,.wav,.pdf,.zip,.exe,.apk"
            />
            
            <button 
              onClick={handleCreateFile}
              className="px-4 border border-[var(--acid-green)] hover:bg-[var(--acid-green)] hover:text-black transition-all flex items-center justify-center"
              title="Create New File"
              onMouseEnter={SoundFX.playHover}
            >
              <FilePlus size={18} />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border border-[var(--acid-green)] hover:bg-[var(--acid-green)] hover:text-black py-3 text-sm font-bold tracking-widest flex items-center justify-center gap-2 group transition-all"
              onMouseEnter={SoundFX.playHover}
            >
              <Upload size={16} />
              IMPORT
            </button>

            {fileType === 'code' && (
              <button 
                onClick={executeCode}
                className="flex-1 border border-[var(--acid-green)] hover:bg-[var(--acid-green)] hover:text-black py-3 text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                onMouseEnter={SoundFX.playHover}
              >
                <Play size={16} />
                EXECUTE
              </button>
            )}

            <button 
              onClick={reset}
              className="px-4 border border-[var(--acid-green)] hover:bg-red-500 hover:text-black hover:border-red-500 transition-all flex items-center justify-center"
              onMouseEnter={SoundFX.playHover}
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};


const HomePage = ({ navigate }) => {
  return (
    <div className="page-transition min-h-screen w-full relative grid grid-cols-12 grid-rows-[auto_1fr_auto] gap-4 p-4 md:p-8 pt-12 overflow-hidden">
      
      <div className="col-span-6 md:col-span-3 flex flex-col items-start space-y-2 z-30 mix-blend-difference">
        <h2 className="font-poster text-5xl md:text-7xl leading-none tracking-tighter opacity-90">1992<span className="text-xl align-top font-jp ml-2">年</span></h2>
        <div className="text-sm md:text-base font-jp opacity-80 leading-relaxed border-l-2 border-[var(--acid-green)] pl-3">
          <p>ロッテルダム映画祭</p>
          <p>出品作品</p>
        </div>
      </div>

      <div className="col-span-6 md:col-span-9 flex justify-end items-start relative z-30">
        <div className="flex flex-col items-end">
          <h3 className="font-poster text-xl md:text-2xl tracking-[0.2em] mb-4 text-right">
            EMETIC POWER
          </h3>
          <div className="flex gap-4">
            <div className="vertical-text text-xs md:text-sm font-jp opacity-70 h-64 border-r border-[var(--acid-green)] pr-2">
              鉄ノクズヲ逆ニ無ニ溶カシャ
            </div>
            <div className="vertical-text text-xs md:text-sm font-jp text-[var(--acid-green)] h-64 font-bold drop-shadow-[0_0_5px_rgba(212,255,0,0.8)]">
              哀レ御主ハ地獄行キ
            </div>
             <div className="vertical-text text-xs md:text-sm font-jp opacity-70 h-64 border-l border-[var(--acid-green)] pl-2">
              生来 生来 生来
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-span-12 row-start-2 relative flex flex-col items-center justify-center z-20 mt-10 md:mt-0">
         <div 
            className="relative w-full max-w-2xl aspect-[4/5] border border-[var(--acid-green)] p-1 md:p-2 bg-black/50 backdrop-blur-sm group cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(212,255,0,0.2)]" 
            onClick={() => { SoundFX.playBoot(); navigate('dashboard'); }}
            onMouseEnter={() => SoundFX.playHover()}
         >
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--acid-green)]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[var(--acid-green)]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[var(--acid-green)]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--acid-green)]"></div>
            
            <HeroImage />

            <div className="absolute bottom-[25%] right-[-10%] md:right-[-5%] text-right bg-black/80 px-4 py-2 transform rotate-[-2deg]">
              <div className="flex items-end justify-end leading-none">
                 <span className="text-6xl md:text-9xl font-poster text-[var(--acid-green)] mr-2">√</span>
                 <span className="text-6xl md:text-9xl font-poster text-[var(--acid-green)] glitch-hover">964</span>
              </div>
            </div>

            <div className="absolute bottom-[10%] left-0 w-full text-center">
              <h1 className="text-6xl md:text-8xl font-poster text-white mix-blend-difference tracking-tighter uppercase transform scale-y-110">
                Pinocchio
              </h1>
            </div>
         </div>
         
         <p className="mt-4 text-[10px] md:text-xs tracking-widest opacity-60 animate-pulse">
            CLICK IMAGE TO ENTER SYSTEM
         </p>
      </div>

      <div className="col-span-12 row-start-3 flex flex-col md:flex-row justify-between items-end pb-8 z-30 mix-blend-difference">
         <div className="text-[10px] md:text-xs font-mono max-w-md opacity-70 space-y-1">
            <p>DIRECTED BY SHOZIN FUKUI</p>
            <p className="font-jp">福居ショウジン監督作品</p>
            <div className="h-[1px] w-12 bg-[var(--acid-green)] my-2"></div>
            <p>COPYRIGHT © 1991. ALL RIGHTS RESERVED.</p>
         </div>

         <div className="text-right mt-4 md:mt-0">
            <div className="flex items-center gap-2 justify-end mb-2">
              <span className="w-2 h-2 bg-[var(--acid-green)] rounded-full animate-ping"></span>
              <span className="text-xs font-bold tracking-widest">SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] font-mono opacity-50">v.2.0.25 [STABLE]</p>
         </div>
      </div>

    </div>
  );
};

const DashboardPage = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const stats = useSystemMonitor();

  const handleTabChange = (tab) => {
    SoundFX.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="page-transition min-h-screen w-full bg-[#050505] text-[var(--acid-green)] p-6 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <h1 className="text-9xl font-poster text-transparent stroke-text" style={{ WebkitTextStroke: '1px var(--acid-green)' }}>964</h1>
      </div>

      {/* Sidebar */}
      <div className="col-span-1 md:col-span-3 border-r border-[var(--acid-green)] border-dashed pr-6 flex flex-col h-full justify-between z-20">
        <div>
          <div 
            className="flex items-center gap-3 mb-12 cursor-pointer group" 
            onClick={() => { SoundFX.playClick(); navigate('home'); }}
            onMouseEnter={SoundFX.playHover}
          >
             <div className="w-8 h-8 bg-[var(--acid-green)] flex items-center justify-center text-black font-bold group-hover:rotate-180 transition-transform duration-300">
               <span className="material-symbols-outlined">←</span>
             </div>
             <h2 className="font-poster text-2xl tracking-tighter">BACK_ROOT</h2>
          </div>

          <nav className="space-y-6">
            {['Overview', 'Modules', 'Database', 'Upload'].map((item) => (
              <div 
                key={item}
                onClick={() => handleTabChange(item.toLowerCase())}
                onMouseEnter={SoundFX.playHover}
                className={`flex items-center gap-4 text-lg cursor-pointer transition-all duration-200 ${activeTab === item.toLowerCase() ? 'opacity-100 translate-x-2' : 'opacity-40 hover:opacity-80'}`}
              >
                <div className={`w-2 h-2 ${activeTab === item.toLowerCase() ? 'bg-[var(--acid-green)]' : 'border border-[var(--acid-green)]'} rotate-45`}></div>
                <span className="uppercase tracking-widest font-bold">{item}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="opacity-50 text-xs font-mono">
          <p>USER: GUEST</p>
          <p>SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-1 md:col-span-9 relative z-20 flex flex-col">
        
        {/* Header */}
        <header className="border-b border-[var(--acid-green)] pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-poster uppercase mb-1">{activeTab}</h1>
            <p className="font-mono text-sm opacity-60">System integration v2.1</p>
          </div>
          <div className="hidden md:flex gap-6">
             <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-2 mb-1">
                   <Cpu size={14} className={stats.cpu > 80 ? "text-red-500 animate-pulse" : ""} />
                   <span className="text-xl font-bold font-poster">{stats.cpu}%</span>
                </div>
                <span className="text-[9px] tracking-widest opacity-60">CPU_LOAD</span>
             </div>
             <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-2 mb-1">
                   <Layers size={14} />
                   <span className="text-xl font-bold font-poster">{stats.mem}%</span>
                </div>
                <span className="text-[9px] tracking-widest opacity-60">RAM_USE</span>
             </div>
             <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-2 mb-1">
                   <Radio size={14} className="animate-pulse" />
                   <span className="text-xl font-bold font-poster">{stats.net}</span>
                </div>
                <span className="text-[9px] tracking-widest opacity-60">MB/S</span>
             </div>
          </div>
        </header>

        {/* Dynamic Module Content */}
        <div className="flex-1 relative">
           {/* Decorative Corners */}
           <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[var(--acid-green)]"></div>
           <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[var(--acid-green)]"></div>
           <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[var(--acid-green)]"></div>
           <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[var(--acid-green)]"></div>

           {activeTab === 'upload' ? (
             <CodeRunner />
           ) : (
             <div className="h-full border border-[var(--acid-green)] border-opacity-30 bg-[rgba(212,255,0,0.02)] p-6 flex flex-col items-center justify-center text-center opacity-60 space-y-6">
                <Disc size={48} className="animate-spin-slow duration-[10s]" />
                <div className="max-w-md">
                  <p className="font-poster text-xl mb-2">MODULE OFFLINE</p>
                  <p className="font-mono text-xs leading-relaxed">
                    Access restricted. Please navigate to the 'UPLOAD' module to initialize code execution environment.
                    SQLite Integration pending administrative authorization.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-sm opacity-30">
                   {[...Array(9)].map((_, i) => (
                     <div key={i} className="h-1 bg-[var(--acid-green)] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState('home');
  return (
    <div className="antialiased min-h-screen text-[var(--acid-green)] selection:bg-[var(--acid-green)] selection:text-black">
      <Fonts />
      <div className="noise-overlay"></div>
      <div className="scanlines"></div>
      <main className="relative z-10">
        {page === 'home' && <HomePage navigate={setPage} />}
        {page === 'dashboard' && <DashboardPage navigate={setPage} />}
      </main>
    </div>
  );
};

export default App;
