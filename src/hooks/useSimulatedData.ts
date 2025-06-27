import { useState, useEffect, useCallback } from 'react';
import { ErrorLog, HourlyData, DashboardState } from '../types';

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
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const useSimulatedData = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    hourlyData: generateInitialHourlyData(),
    errorLogs: generateInitialErrorLogs(),
    isLive: true,
    webhookUrl: `${window.location.origin}/webhook`,
  });

  const addNewErrorLog = useCallback(() => {
    const newError: ErrorLog = {
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
      severity: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'info',
      source: `service-${Math.floor(Math.random() * 5) + 1}`,
    };

    setDashboardState(prev => ({
      ...prev,
      errorLogs: [newError, ...prev.errorLogs.slice(0, 49)], // Keep only 50 most recent
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

  useEffect(() => {
    if (!dashboardState.isLive) return;

    const errorInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new error every 3 seconds
        addNewErrorLog();
      }
    }, 3000);

    const dataInterval = setInterval(() => {
      updateCurrentHourData();
    }, 5000);

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