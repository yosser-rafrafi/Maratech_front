import { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart Components
export const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}15` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color }}>{icon}</span>
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
);

export const AttendanceChart = ({ data }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    };

    const chartData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        datasets: [
            {
                label: 'Taux de présence (%)',
                data: data || [85, 92, 88, 75, 90, 82],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    return <Bar options={options} data={chartData} />;
};

export const FormationDistributionChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || ['React', 'Node.js', 'Python', 'UX/UI', 'DevOps'],
        datasets: [
            {
                data: data?.values || [12, 19, 8, 15, 6],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderWidth: 0,
            },
        ],
    };

    return <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />;
};

export const ProgressLineChart = ({ data }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            y: { beginAtZero: true }
        },
        elements: {
            line: { tension: 0.4 } // smooth curves
        }
    };

    const chartData = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
            {
                fill: true,
                label: 'Sessions Complétées',
                data: data || [4, 6, 8, 5, 12, 15],
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
            }
        ]
    };

    return <Line options={options} data={chartData} />;
};
