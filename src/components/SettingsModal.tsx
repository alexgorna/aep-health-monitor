import React, { useState } from 'react';
import { X, Copy, Check, Link, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  isConnected: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  webhookUrl, 
  isConnected 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Webhook Configuration</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Public Webhook Required</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Adobe I/O Events requires a publicly accessible webhook URL. Deploy this dashboard to get a public URL.
            </p>
            <button
              onClick={() => {/* Deploy action will be handled by the deploy button */}}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Deploy to Get Public URL
            </button>
          </div>

          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            isConnected 
              ? 'bg-green-900/20 border border-green-500/30' 
              : 'bg-red-900/20 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Webhook server is running</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Webhook server is disconnected</span>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Webhook Endpoint (Local Development)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-mono"
              />
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                }`}
                title={copied ? 'Copied!' : 'Copy URL'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              This local URL won't work with Adobe I/O Events. Deploy to get a public URL.
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Adobe I/O Events Setup</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div>
                <p className="font-medium text-slate-300 mb-1">1. Deploy Dashboard</p>
                <p>Click the deploy button above to get a public webhook URL that Adobe I/O Events can reach.</p>
              </div>
              <div>
                <p className="font-medium text-slate-300 mb-1">2. Challenge Validation</p>
                <p>This webhook automatically handles Adobe I/O Events challenge validation. When Adobe sends a GET request with a <code className="bg-slate-800 px-1 rounded">challenge</code> parameter, it will be returned in the response.</p>
              </div>
              <div>
                <p className="font-medium text-slate-300 mb-1">3. Event Processing</p>
                <p>POST requests containing AEP events will be parsed and displayed in real-time on the dashboard.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Supported Event Types</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-slate-300">Flow Events</p>
                  <p>Data flow execution status, metrics, and completion information</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-slate-300">Alert Events</p>
                  <p>System alerts with severity levels and alert details</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Example AEP Flow Event</h3>
            <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap">
{`{
  "event_id": "c7ec11bd-8eb8-4b8a-a81b-fe05b5ed8e48",
  "event": {
    "id": "25e3d4dd-656d-46c5-8ee4-939611c70f96",
    "flowId": "bba58fe8-2ade-4a3e-9c87-1eb389dd6c86",
    "flowName": "sample_flow",
    "flowType": "batch",
    "sandboxName": "sample_sandbox",
    "metrics": {
      "statusSummary": { "status": "success" },
      "durationSummary": {
        "startedAtUTC": 1712502653282,
        "completedAtUTC": 1712502713875
      }
    }
  }
}`}
            </pre>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Example AEP Alert Event</h3>
            <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap">
{`{
  "event_id": "60207881-6040-4534-9e7b-5b8237636d94",
  "event": {
    "alertName": "sample_alert",
    "message": "sample_message",
    "severity": "high",
    "status": "SAMPLE_STATUS",
    "sandboxName": "sample_sandbox",
    "createdAt": "2025-06-27T10:40:34Z"
  }
}`}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;