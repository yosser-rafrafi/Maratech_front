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

const CHART_COLORS = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
];

// Create canvas pattern for chart segments (matches formation card patterns)
function createChartPattern(color, patternType) {
    if (typeof document === 'undefined') return color;
    const canvas = document.createElement('canvas');
    const size = 16;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return color;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;

    switch (patternType) {
        case 'dots':
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'hatching':
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, size);
            ctx.moveTo(size, 0);
            ctx.lineTo(0, size);
            ctx.stroke();
            break;
        case 'triangles':
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, 0);
            ctx.lineTo(size / 2, size);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'stripes-h':
            for (let y = 0; y < size; y += 4) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size, y);
                ctx.stroke();
            }
            break;
        case 'stripes-v':
            for (let x = 0; x < size; x += 4) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, size);
                ctx.stroke();
            }
            break;
        case 'grid':
            for (let i = 0; i <= size; i += 4) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(size, i);
                ctx.stroke();
            }
            break;
        case 'circles':
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'diamonds':
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(size, size / 2);
            ctx.lineTo(size / 2, size);
            ctx.lineTo(0, size / 2);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'waves':
            ctx.beginPath();
            ctx.arc(4, 8, 4, Math.PI, 0);
            ctx.arc(12, 8, 4, Math.PI, 0);
            ctx.stroke();
            break;
        case 'zigzag':
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(size / 2, 12);
            ctx.lineTo(size, 4);
            ctx.stroke();
            break;
        case 'cross':
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(size / 2, size);
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            break;
        case 'chevrons':
            ctx.beginPath();
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size / 2, 0);
            ctx.lineTo(size / 2, size);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            break;
        case 'bricks':
            ctx.strokeRect(0, 0, size / 2, size / 2);
            ctx.strokeRect(size / 2, size / 2, size / 2, size / 2);
            break;
        case 'hexagons':
            ctx.beginPath();
            ctx.moveTo(size / 4, 0);
            ctx.lineTo(size * 3 / 4, 0);
            ctx.lineTo(size, size / 2);
            ctx.lineTo(size * 3 / 4, size);
            ctx.lineTo(size / 4, size);
            ctx.lineTo(0, size / 2);
            ctx.closePath();
            ctx.stroke();
            break;
        default:
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    return ctx.createPattern(canvas, 'repeat') || color;
}

export const FormationDistributionChart = ({ data }) => {
    const labels = data?.labels || ['React', 'Node.js', 'Python', 'UX/UI', 'DevOps'];
    const values = data?.values || [12, 19, 8, 15, 6];
    const colors = data?.colors || labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    const patterns = data?.patterns || [];

    // Build backgroundColor: use pattern when we have pattern data, else solid color
    const backgroundColor = labels.map((_, i) => {
        const color = colors[i] || CHART_COLORS[i % CHART_COLORS.length];
        if (patterns[i]) {
            return createChartPattern(color, patterns[i]);
        }
        return color;
    });

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor,
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

    const defaultLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const chartData = {
        labels: data?.labels || defaultLabels,
        datasets: [
            {
                fill: true,
                label: 'Sessions',
                data: data?.values || [4, 6, 8, 5, 12, 15],
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
            }
        ]
    };

    return <Line options={options} data={chartData} />;
};
