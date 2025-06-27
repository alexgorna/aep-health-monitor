import { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorLog, HourlyData, DashboardState, WebhookEvent } from '../types';

const generateRandomEvents = (): number => Math.floor(Math.random() * 50) + 10;
const generateRandomErrors = (): number => Math.floor(Math.random() * 8);

const ERROR_MESSAGES = [
  'Database connection timeout',
  'API rate limit exceeded',
  'Authentication failed for user session',
  'Memory allocation error in service worker',
  'Network request failed with status 500',
  'Invalid JSON payload received',
  'SSL certificate verification failed',
  'Cache invalidation timeout',
  'Resource not found in storage',
  'Permission denied for resource access',
  'Queue processing backlog exceeded',
  'Microservice health check failed',
];

const generateInitialHourlyData = (): HourlyData[] => {
  const now = new Date();
  const data: HourlyData[] = [];
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
    data.push({
      hour,
      events: generateRandomEvents(),
      errors: generateRandomErrors(),
    });
  }
  
  return data;
};

const generateInitialErrorLogs = (): ErrorLog[] => {
  const logs: ErrorLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    logs.push({
      id: `error-${i}`,
      timestamp,
      message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
      severity: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'info',
      source: `service-${Math.floor(Math.random() * 5) + 1}`,
      type: 'error',
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const useWebSocketData = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    hourlyData: generateInitialHourlyData(),
    errorLogs: generateInitialErrorLogs(),
    isLive: true,
    webhookUrl: 'http://localhost:3001/webhook',
    isConnected: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch webhook URL from backend
  const fetchWebhookUrl = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/webhook-url');
      const data = await response.json();
      setDashboardState(prev => ({
        ...prev,
        webhookUrl: data.webhookUrl,
      }));
    } catch (error) {
      console.error('Failed to fetch webhook URL:', error);
      setDashboardState(prev => ({
        ...prev,
        webhookUrl: 'http://localhost:3001/webhook',
      }));
    }
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket('ws://localhost:3001');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setDashboardState(prev => ({ ...prev, isConnected: true }));
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebhookEvent = JSON.parse(event.data);
          
          if (message.type === 'webhook_event') {
            const newEvent = message.data;
            
            setDashboardState(prev => {
              // Add to error logs
              const updatedErrorLogs = [newEvent, ...prev.errorLogs.slice(0, 49)];
              
              // Update hourly data
              const newHourlyData = [...prev.hourlyData];
              const eventHour = newEvent.timestamp.getHours();
              const hourIndex = newHourlyData.findIndex(data => data.hour === eventHour);
              
              if (hourIndex !== -1) {
                if (newEvent.type === 'error' || newEvent.severity === 'error') {
                  newHourlyData[hourIndex].errors += 1;
                } else {
                  newHourlyData[hourIndex].events += 1;
                }
              }
              
              return {
                ...prev,
                errorLogs: updatedErrorLogs,
                hourlyData: newHourlyData,
              };
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setDashboardState(prev => ({ ...prev, isConnected: false }));
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, []);

  // Simulated data for demo purposes
  const addNewErrorLog = useCallback(() => {
    const newError: ErrorLog = {
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
      severity: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'info',
      source: `service-${Math.floor(Math.random() * 5) + 1}`,
      type: 'error',
    };

    setDashboardState(prev => ({
      ...prev,
      errorLogs: [newError, ...prev.errorLogs.slice(0, 49)],
    }));
  }, []);

  const updateCurrentHourData = useCallback(() => {
    setDashboardState(prev => {
      const newHourlyData = [...prev.hourlyData];
      const currentHour = new Date().getHours();
      const currentHourIndex = newHourlyData.findIndex(data => data.hour === currentHour);
      
      if (currentHourIndex !== -1) {
        newHourlyData[currentHourIndex] = {
          ...newHourlyData[currentHourIndex],
          events: newHourlyData[currentHourIndex].events + Math.floor(Math.random() * 3),
          errors: newHourlyData[currentHourIndex].errors + (Math.random() > 0.8 ? 1 : 0),
        };
      }
      
      return {
        ...prev,
        hourlyData: newHourlyData,
      };
    });
  }, []);

  // Initialize connections
  useEffect(() => {
    fetchWebhookUrl();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchWebhookUrl, connectWebSocket]);

  // Simulated data updates (for demo when no real data is coming in)
  useEffect(() => {
    if (!dashboardState.isLive) return;

    const errorInterval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance of new error every 5 seconds
        addNewErrorLog();
      }
    }, 5000);

    const dataInterval = setInterval(() => {
      updateCurrentHourData();
    }, 8000);

    return () => {
      clearInterval(errorInterval);
      clearInterval(dataInterval);
    };
  }, [dashboardState.isLive, addNewErrorLog, updateCurrentHourData]);

  const toggleLiveMode = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      isLive: !prev.isLive,
    }));
  }, []);

  return {
    ...dashboardState,
    toggleLiveMode,
  };
};