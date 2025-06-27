import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, Info, AlertCircle, Activity, Database } from 'lucide-react';
import { ErrorLog } from '../types';

interface ErrorViewerProps {
  errors: ErrorLog[];
}

const ErrorViewer: React.FC<ErrorViewerProps> = ({ errors }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ 
        top: containerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  const getSeverityIcon = (severity: string, type?: string) => {
    if (type === 'event') {
      return <Activity className="w-4 h-4 text-blue-400" />;
    }
    
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string, type?: string) => {
    if (type === 'event' && severity === 'info') {
      return 'border-l-blue-500 bg-blue-500/5';
    }
    
    switch (severity) {
      case 'error':
        return 'border-l-red-500 bg-red-500/5';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEventTypeLabel = (error: ErrorLog) => {
    if (error.metadata?.flowId) {
      return 'Flow Event';
    }
    if (error.metadata?.alertName) {
      return 'Alert Event';
    }
    if (error.type === 'event') {
      return 'Event';
    }
    return 'Error';
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return null;

    const relevantFields = [];
    
    if (metadata.flowName) relevantFields.push(['Flow', metadata.flowName]);
    if (metadata.flowType) relevantFields.push(['Type', metadata.flowType]);
    if (metadata.alertName) relevantFields.push(['Alert', metadata.alertName]);
    if (metadata.status) relevantFields.push(['Status', metadata.status]);
    if (metadata.duration) relevantFields.push(['Duration', `${Math.round(metadata.duration / 1000)}s`]);
    if (metadata.inputBytes !== undefined) relevantFields.push(['Input', `${(metadata.inputBytes / 1024).toFixed(1)}KB`]);

    if (relevantFields.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {relevantFields.map(([key, value]) => (
          <span key={key} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
            {key}: {value}
          </span>
        ))}
      </div>
    );
  };

  // Auto-scroll to top when new errors are added
  useEffect(() => {
    if (containerRef.current && errors.length > 0) {
      const isScrolledToTop = containerRef.current.scrollTop < 50;
      if (isScrolledToTop) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [errors]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">
          Event Logs ({errors.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollToTop}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Scroll to top"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={scrollToBottom}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
      >
        {errors.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No events in the last 24 hours</p>
            <p className="text-sm mt-1">Waiting for AEP webhook data...</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {errors.map((error) => (
              <div
                key={error.id}
                className={`border-l-4 p-3 rounded-r-lg transition-all duration-200 hover:bg-slate-700/50 ${getSeverityColor(error.severity, error.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(error.severity, error.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded font-medium">
                          {getEventTypeLabel(error)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium break-words mb-1">
                        {error.message}
                      </p>
                      <div className="flex items-center space-x-4">
                        {error.source && (
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            {error.source}
                          </span>
                        )}
                      </div>
                      {renderMetadata(error.metadata)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorViewer;