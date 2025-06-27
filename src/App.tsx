import React from 'react';
import Header from './components/Header';
import BarChart from './components/BarChart';
import ErrorViewer from './components/ErrorViewer';
import { useWebSocketData } from './hooks/useWebSocketData';

function App() {
  const { 
    hourlyData, 
    errorLogs, 
    isLive, 
    isConnected, 
    webhookUrl, 
    isDevelopment,
    toggleLiveMode 
  } = useWebSocketData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        isLive={isLive}
        isConnected={isConnected}
        webhookUrl={webhookUrl}
        isDevelopment={isDevelopment}
        onToggleLive={toggleLiveMode}
      />
      
      <main className="p-6 space-y-6">
        <BarChart data={hourlyData} />
        <ErrorViewer errors={errorLogs} />
      </main>
    </div>
  );
}

export default App;
