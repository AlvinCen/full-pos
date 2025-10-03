import React, { useState } from 'react';

interface ChartData {
  date: string;
  total: number;
}

interface BarChartProps {
  data: ChartData[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
const formatDateShort = (dateString: string) => {
    // Use replace to ensure date is parsed as local time
    const date = new Date(dateString.replace(/-/g, '/'));
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 p-8 h-80 flex items-center justify-center">No sales data available for this period.</div>;
  }

  const chartHeight = 250;
  const chartWidth = 1000;
  const padding = { top: 20, right: 20, bottom: 40, left: 80 };

  const availableWidth = chartWidth - padding.left - padding.right;
  const availableHeight = chartHeight - padding.top - padding.bottom;
  
  const maxValue = Math.max(...data.map(d => d.total), 0) * 1.1 || 1000; // Add buffer, prevent division by zero
  const barWidth = data.length > 0 ? (availableWidth / data.length) * 0.8 : 0;
  const barGap = data.length > 0 ? (availableWidth / data.length) * 0.2 : 0;

  const yAxisLabels = [];
  const numLabels = 5;
  for (let i = 0; i <= numLabels; i++) {
    const value = (maxValue / numLabels) * i;
    const yPos = availableHeight - (value / maxValue) * availableHeight;
    yAxisLabels.push({ value, y: yPos + padding.top });
  }
  
  const handleMouseMove = (e: React.MouseEvent, d: ChartData) => {
    const chartContainer = (e.currentTarget as SVGElement).closest('.chart-container');
    if (!chartContainer) return;
    const rect = chartContainer.getBoundingClientRect();
    setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: `${formatDateShort(d.date)}: ${formatCurrency(d.total)}`
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };
  
  return (
    <div className="relative w-full overflow-x-auto chart-container">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[600px]">
            {/* Y Axis */}
            <g className="text-xs text-slate-400">
                {yAxisLabels.map(label => (
                    <g key={label.value}>
                        <line x1={padding.left} y1={label.y} x2={chartWidth - padding.right} y2={label.y} stroke="rgba(71, 85, 105, 0.5)" strokeDasharray="2,2" />
                        <text x={padding.left - 10} y={label.y + 4} textAnchor="end" fill="currentColor">
                            {label.value >= 1000 ? `${Math.round(label.value / 1000)}k` : Math.round(label.value)}
                        </text>
                    </g>
                ))}
            </g>

            {/* Bars and X Axis */}
            <g>
                {data.map((d, i) => {
                    const barHeight = maxValue === 0 ? 0 : (d.total / maxValue) * availableHeight;
                    const x = padding.left + i * (barWidth + barGap);
                    const y = chartHeight - padding.bottom - barHeight;

                    return (
                        <g key={d.date}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                className="fill-indigo-500 hover:fill-indigo-400 transition-colors"
                                onMouseMove={(e) => handleMouseMove(e, d)}
                                onMouseOut={handleMouseOut}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight - padding.bottom + 15}
                                textAnchor="middle"
                                className="text-xs fill-slate-400"
                            >
                                {data.length < 20 || i % Math.ceil(data.length / 20) === 0 ? formatDateShort(d.date) : ''}
                            </text>
                        </g>
                    );
                })}
            </g>
        </svg>
        {tooltip && (
            <div 
                className="absolute bg-slate-900 border border-slate-700 text-white text-sm px-3 py-1 rounded-md shadow-lg pointer-events-none z-10"
                style={{ 
                    top: `${tooltip.y}px`, 
                    left: `${tooltip.x}px`, 
                    transform: 'translate(15px, -100%)' 
                }}
            >
                {tooltip.content}
            </div>
        )}
    </div>
  );
};

export default BarChart;
