import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Store connected WebSocket clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });
});

// Broadcast data to all connected clients
const broadcast = (data) => {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

// Parse AEP event data
const parseAEPEvent = (payload) => {
  const { event_id, event } = payload;
  
  // Handle flow events (first payload type)
  if (event.flowId && event.metrics) {
    const status = event.metrics.statusSummary?.status || 'unknown';
    const isError = status !== 'success';
    const duration = event.metrics.durationSummary ? 
      event.metrics.durationSummary.completedAtUTC - event.metrics.durationSummary.startedAtUTC : 0;
    
    return {
      id: event_id,
      timestamp: new Date(event.createdAt || Date.now()),
      type: isError ? 'error' : 'event',
      message: isError ? 
        `Flow ${event.flowName || event.flowId} failed with status: ${status}` :
        `Flow ${event.flowName || event.flowId} completed successfully`,
      severity: isError ? 'error' : 'info',
      source: `${event.flowType || 'flow'}-${event.sandboxName || 'unknown'}`,
      metadata: {
        flowId: event.flowId,
        flowName: event.flowName,
        flowType: event.flowType,
        sandboxName: event.sandboxName,
        duration: duration,
        inputBytes: event.metrics.sizeSummary?.inputBytes || 0,
        inputFileCount: event.metrics.fileSummary?.inputFileCount || 0,
        status: status
      }
    };
  }
  
  // Handle alert events (second payload type)
  if (event.alertName || event.severity) {
    const isError = event.severity === 'high' || event.status === 'FAILED';
    
    return {
      id: event_id,
      timestamp: new Date(event.createdAt || Date.now()),
      type: isError ? 'error' : 'event',
      message: event.message || `Alert: ${event.alertName || event.name || 'Unknown alert'}`,
      severity: event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'info',
      source: `alert-${event.sandboxName || 'unknown'}`,
      metadata: {
        alertName: event.alertName,
        status: event.status,
        value: event.value,
        url: event.url,
        flowId: event.flowId,
        flowRunId: event.flowRunId,
        sandboxName: event.sandboxName
      }
    };
  }
  
  // Fallback for unknown event types
  return {
    id: event_id,
    timestamp: new Date(),
    type: 'event',
    message: `Unknown event type received: ${JSON.stringify(event).substring(0, 100)}...`,
    severity: 'info',
    source: 'unknown',
    metadata: event
  };
};

// Webhook endpoint - handles both GET (challenge) and POST (events)
app.all('/webhook', (req, res) => {
  console.log(`${req.method} /webhook`, {
    query: req.query,
    body: req.method === 'POST' ? 'POST data received' : undefined
  });
  
  // Handle challenge validation (GET request)
  if (req.method === 'GET' && req.query.challenge) {
    console.log('Challenge validation:', req.query.challenge);
    return res.json({ challenge: req.query.challenge });
  }
  
  // Handle webhook events (POST request)
  if (req.method === 'POST') {
    try {
      const parsedEvent = parseAEPEvent(req.body);
      console.log('Parsed AEP event:', {
        id: parsedEvent.id,
        type: parsedEvent.type,
        message: parsedEvent.message,
        source: parsedEvent.source
      });
      
      // Broadcast to connected clients
      broadcast({
        type: 'webhook_event',
        data: parsedEvent
      });
      
      return res.json({ 
        success: true, 
        message: 'Event processed successfully',
        eventId: parsedEvent.id
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payload format' 
      });
    }
  }
  
  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connectedClients: clients.size
  });
});

// Get webhook URL endpoint
app.get('/api/webhook-url', (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get('host')}/webhook`;
  res.json({ webhookUrl });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});