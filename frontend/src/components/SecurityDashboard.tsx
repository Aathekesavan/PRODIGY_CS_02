import React, { useEffect, useState } from 'react';
import { Shield, Zap, Image as ImageIcon, Key, AlertTriangle } from 'lucide-react';

interface SecurityDashboardProps {
  imageSize: string;
  resolution: string;
  processingTime: number;
  encryptionKey: string;
  engineOnline: boolean;
  algorithm: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  imageSize,
  resolution,
  processingTime,
  encryptionKey,
  engineOnline,
  algorithm
}) => {
  const [uptime, setUptime] = useState<number>(0);

  // Uptime ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Evaluate key strength & threat level
  const getKeyStrength = (key: string) => {
    if (!key) return { score: 0, text: 'NO KEY SEEDED', color: 'bg-zinc-800 text-zinc-500 border-zinc-700', label: 'INACTIVE', threat: 'CRITICAL', threatColor: 'text-cyber-red border-cyber-red/30 bg-cyber-red/10' };
    
    let score = 0;
    if (key.length >= 6) score += 1;
    if (key.length >= 10) score += 1;
    
    const hasLower = /[a-z]/.test(key);
    const hasUpper = /[A-Z]/.test(key);
    const hasDigit = /[0-9]/.test(key);
    const hasSpecial = /[^A-Za-z0-9]/.test(key);
    
    if (hasLower && hasUpper) score += 1;
    if (hasDigit) score += 1;
    if (hasSpecial) score += 1;

    if (score <= 1) {
      return {
        score: 20,
        text: 'WEAK SECURE (LEVEL 1)',
        color: 'bg-cyber-red/20 text-cyber-red border-cyber-red/50 shadow-[0_0_10px_rgba(255,0,60,0.2)]',
        label: 'VULNERABLE',
        threat: 'HIGH',
        threatColor: 'text-cyber-red border-cyber-red/40 bg-cyber-red/10 animate-pulse'
      };
    } else if (score <= 3) {
      return {
        score: 55,
        text: 'STABLE ENCRYPT (LEVEL 2)',
        color: 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/50 shadow-[0_0_10px_rgba(255,246,0,0.15)]',
        label: 'STABLE',
        threat: 'ELEVATED',
        threatColor: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5'
      };
    } else if (score === 4) {
      return {
        score: 80,
        text: 'ADVANCED SHIELD (LEVEL 3)',
        color: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]',
        label: 'SECURED',
        threat: 'MINIMAL',
        threatColor: 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5'
      };
    } else {
      return {
        score: 100,
        text: 'QUANTUM SHIELD (LEVEL 4)',
        color: 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/50 shadow-[0_0_10px_rgba(189,0,255,0.3)]',
        label: 'MILITARY-GRADE',
        threat: 'ZERO-RISK',
        threatColor: 'text-cyber-green border-cyber-green/30 bg-cyber-green/5'
      };
    }
  };

  const keyDetails = getKeyStrength(encryptionKey);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Real-time Crypto Analytics */}
      <div className="cyber-panel p-4 rounded-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-3">
            <Zap className="w-4 h-4 text-cyber-cyan" />
            <h3 className="font-mono text-xs text-cyber-cyan tracking-widest uppercase">REAL-TIME CRYPTO ANALYTICS</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-cyber-dark/40 border border-cyber-border p-2.5 rounded">
              <span className="text-zinc-500 block text-[10px] tracking-wider mb-1">IMAGE RESOLUTION</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                {resolution || '0 x 0'}
              </span>
            </div>
            
            <div className="bg-cyber-dark/40 border border-cyber-border p-2.5 rounded">
              <span className="text-zinc-500 block text-[10px] tracking-wider mb-1">FILE SIZE</span>
              <span className="text-white font-medium">
                {imageSize || '0.00 KB'}
              </span>
            </div>

            <div className="bg-cyber-dark/40 border border-cyber-border p-2.5 rounded">
              <span className="text-zinc-500 block text-[10px] tracking-wider mb-1">PROCESSING TIME</span>
              <span className={`font-semibold ${processingTime > 0 ? 'text-cyber-green neon-text-green' : 'text-zinc-500'}`}>
                {processingTime > 0 ? `${processingTime} ms` : 'IDLE'}
              </span>
            </div>

            <div className="bg-cyber-dark/40 border border-cyber-border p-2.5 rounded">
              <span className="text-zinc-500 block text-[10px] tracking-wider mb-1">SELECTED ENGINE</span>
              <span className="text-cyber-purple neon-text-purple font-medium">
                {algorithm ? algorithm.toUpperCase() : 'NONE'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Strength Meter */}
        <div className="mt-4 pt-3 border-t border-cyber-border/40">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-zinc-500 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              KEY LENGTH: {encryptionKey.length} BITS
            </span>
            <span className="font-semibold text-zinc-300 tracking-wide text-[10px]">{keyDetails.label}</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full bg-cyber-dark/80 rounded overflow-hidden border border-cyber-border p-0.5">
            <div 
              className={`h-full rounded-sm transition-all duration-500 ${
                keyDetails.score <= 20 ? 'bg-cyber-red shadow-[0_0_10px_rgba(255,0,60,0.5)]' :
                keyDetails.score <= 55 ? 'bg-cyber-yellow shadow-[0_0_10px_rgba(255,246,0,0.5)]' :
                keyDetails.score <= 80 ? 'bg-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]' :
                'bg-cyber-purple shadow-[0_0_10px_rgba(189,0,255,0.5)]'
              }`}
              style={{ width: `${keyDetails.score}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-mono text-zinc-400">STRENGTH:</span>
            <span className={`px-2 py-0.5 border text-[10px] font-mono rounded-sm font-semibold tracking-widest ${keyDetails.color}`}>
              {keyDetails.text}
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Security Status */}
      <div className="cyber-panel p-4 rounded-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-3">
            <Shield className="w-4 h-4 text-cyber-cyan" />
            <h3 className="font-mono text-xs text-cyber-cyan tracking-widest uppercase">SECURITY SHIELD CONSOLE</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-2 px-2.5 bg-cyber-dark/40 border border-cyber-border rounded">
              <span className="text-zinc-500">ENCRYPTION ENGINE:</span>
              <span className={`flex items-center gap-1.5 font-bold ${engineOnline ? 'text-cyber-green neon-text-green' : 'text-cyber-red animate-pulse'}`}>
                <span className={`w-2 h-2 rounded-full ${engineOnline ? 'bg-cyber-green animate-ping' : 'bg-cyber-red'}`} />
                {engineOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-2.5 bg-cyber-dark/40 border border-cyber-border rounded">
              <span className="text-zinc-500">ACTIVE SESSION TIME:</span>
              <span className="text-zinc-300 font-medium">{formatUptime(uptime)}</span>
            </div>

            <div className="flex justify-between items-center py-2 px-2.5 bg-cyber-dark/40 border border-cyber-border rounded">
              <span className="text-zinc-500">CORRUPTION ATTACK THREAT:</span>
              <span className={`px-2 py-0.5 border text-[10px] rounded-sm font-semibold tracking-wider flex items-center gap-1 ${keyDetails.threatColor}`}>
                <AlertTriangle className="w-3 h-3" />
                {keyDetails.threat}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyber-border/40 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
          <span>HOST: localhost:5000</span>
          <span>SECURE PROTOCOL v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
