import React, { useState } from 'react';
import { Settings, Activity, Pause, Play, Wifi, WifiOff } from 'lucide-react';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  isLive: boolean;
  isConnected: boolean;
  webhookUrl: string;
  isDevelopment?: boolean;
  onToggleLive: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isLive, 
  isConnected, 
  webhookUrl, 
  isDevelopment = false,
  onToggleLive 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                AEP Health Monitoring
              </h1>
              <p className="text-slate-300 text-sm">Last 24 Hours</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                : 'bg-red-900/30 text-red-400 border border-red-500/30'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
            
            <button
              onClick={onToggleLive}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isLive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Paused</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webhookUrl={webhookUrl}
        isConnected={isConnected}
        isDevelopment={isDevelopment}
      />
    </>
  );
};

export default Header;
