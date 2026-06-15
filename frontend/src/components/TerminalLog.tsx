import React, { useEffect, useRef } from 'react';
import { Terminal, Download, ShieldAlert } from 'lucide-react';

export interface LogEntry {
  timestamp: string;
  source: 'SYSTEM' | 'USER' | 'ENGINE' | 'SECURITY';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface TerminalLogProps {
  logs: LogEntry[];
  onClear?: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs, onClear }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleExportLogs = () => {
    const logContent = logs
      .map((log) => `[${log.timestamp}] [${log.source}] ${log.message}`)
      .join('\n');
    
    const header = `==================================================\n` +
                   `          PIXELCRYPT SECURITY SYSTEM LOGS         \n` +
                   `          Exported: ${new Date().toISOString()}  \n` +
                   `==================================================\n\n`;

    const blob = new Blob([header + logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixelcrypt-session-${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLogColor = (entry: LogEntry) => {
    switch (entry.type) {
      case 'success':
        return 'text-cyber-green';
      case 'warning':
        return 'text-cyber-yellow';
      case 'error':
        return 'text-cyber-red font-semibold';
      case 'info':
      default:
        if (entry.source === 'USER') return 'text-zinc-300';
        if (entry.source === 'ENGINE') return 'text-cyber-purple';
        return 'text-cyber-cyan';
    }
  };

  return (
    <div className="cyber-panel p-4 rounded-lg flex flex-col h-[320px]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-mono text-xs text-cyber-cyan tracking-widest uppercase">SECURITY SYSTEM DECK LOGS</h3>
        </div>
        <div className="flex items-center gap-2">
          {onClear && (
            <button 
              onClick={onClear}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase px-1.5 py-0.5 border border-zinc-800 rounded hover:border-zinc-700 bg-cyber-dark/30"
            >
              Flush
            </button>
          )}
          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-cyan hover:text-white transition-colors uppercase border border-cyber-cyan/30 px-2 py-0.5 rounded bg-cyber-cyan/5 hover:bg-cyber-cyan/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-3 h-3" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Terminal screen */}
      <div className="flex-1 bg-cyber-dark/95 border border-cyber-border/60 p-3 rounded font-mono text-xs overflow-y-auto space-y-1.5 shadow-inner relative">
        {/* Decorative horizontal lines */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(18,19,26,0)_80%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
        
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic flex items-center gap-1.5 py-8 justify-center select-none">
            <ShieldAlert className="w-4 h-4" />
            SECURE LOG STREAM EMPTY. INITIATING OPERATIONS...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="leading-5 break-all hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
              <span className="text-zinc-600 mr-2 select-none">[{log.timestamp}]</span>
              <span className="text-zinc-500 font-bold border border-zinc-800 px-1 py-0.2 rounded text-[10px] uppercase mr-2 tracking-wide select-none">
                {log.source}
              </span>
              <span className={getLogColor(log)}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
