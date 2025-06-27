import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HourlyData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: HourlyData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const chartData = {
    labels: data.map(d => formatHour(d.hour)),
    datasets: [
      {
        label: 'Events',
        data: data.map(d => d.events),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Errors',
        data: data.map(d => d.errors),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const hour = context[0].label;
            return `Hour: ${hour}`;
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [data]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4">
        Events & Errors by Hour
      </h2>
      <div className="h-64">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart;