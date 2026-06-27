import React, { useMemo, useState } from 'react';
import type { IRevenueDataPoint } from '../../Bookings/types/merchant.types';

interface RevenueChartProps {
  data: IRevenueDataPoint[];
}

type RevenueRange = '12M' | '6M' | '30D';

const RANGE_SIZE: Record<RevenueRange, number> = {
  '12M': 12,
  '6M': 6,
  '30D': 1,
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [activeRange, setActiveRange] = useState<RevenueRange>('12M');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const count = RANGE_SIZE[activeRange];
    return data.slice(Math.max(0, data.length - count));
  }, [activeRange, data]);

  const chartConfig = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { 
        points: [], 
        pathD: '', 
        areaD: '', 
        yLabels: [], 
        width: 800, 
        height: 240, 
        marginX: 45, 
        marginTop: 20, 
        chartHeight: 190 
      };
    }

    const maxValue = Math.max(...chartData.map(d => d.value));
    const minValue = Math.min(...chartData.map(d => d.value));
    const padding = maxValue === minValue ? 10 : (maxValue - minValue) * 0.15;
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);
    const range = Math.max(1, adjustedMax - adjustedMin);

    const width = 800;
    const height = 240;
    const marginX = 45;
    const marginTop = 20;
    const marginBottom = 30;
    const chartWidth = width - marginX * 2;
    const chartHeight = height - marginTop - marginBottom;

    const points = chartData.map((d, i) => ({
      x: marginX + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2),
      y: marginTop + chartHeight - ((d.value - adjustedMin) / range) * chartHeight,
      value: d.value,
      month: d.month,
    }));

    // Create smooth bezier curve path
    let pathD = '';
    let areaD = '';

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      
      if (points.length === 1) {
        // Just a point, maybe a short horizontal line or just the point circle
        pathD += ` L ${points[0].x + 0.1} ${points[0].y}`;
      } else {
        for (let i = 0; i < points.length - 1; i++) {
          const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
          const cp1y = points[i].y;
          const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
          const cp2y = points[i + 1].y;
          pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
        }
      }

      // Fill area path
      areaD = pathD +
        ` L ${points[points.length - 1].x} ${marginTop + chartHeight}` +
        ` L ${points[0].x} ${marginTop + chartHeight} Z`;
    }

    // Y-axis labels
    const gridLines = 5;
    const yLabels = Array.from({ length: gridLines }, (_, i) => {
      const value = adjustedMin + (range / (gridLines - 1)) * i;
      const y = marginTop + chartHeight - (i / (gridLines - 1)) * chartHeight;
      return { value: Math.round(value), y };
    });

    return { points, pathD, areaD, yLabels, width, height, marginX, marginTop, chartHeight };
  }, [chartData]);

  const isEmpty = !chartData || chartData.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-75 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800 mb-0.5">Revenue Overview</h3>
          <p className="text-[12px] text-slate-400">Monthly earnings trend</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveRange('12M')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border-none cursor-pointer transition-colors ${activeRange === '12M' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            12M
          </button>
          <button
            type="button"
            onClick={() => setActiveRange('6M')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors ${activeRange === '6M' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            6M
          </button>
          <button
            type="button"
            onClick={() => setActiveRange('30D')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors ${activeRange === '30D' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 lg:px-3 pb-4 flex-1 relative flex items-center justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">No revenue data available yet</p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4af" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2dd4af" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4af" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {chartConfig.yLabels.map((label, i) => (
              <g key={i}>
                <line
                  x1={chartConfig.marginX}
                  y1={label.y}
                  x2={chartConfig.width - chartConfig.marginX}
                  y2={label.y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? 'none' : '4 4'}
                />
                <text
                  x={chartConfig.marginX - 8}
                  y={label.y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-300"
                  fontFamily="system-ui"
                  fontSize="10"
                >
                  ${(label.value / 1000).toFixed(1)}k
                </text>
              </g>
            ))}

            {/* Area fill */}
            <path d={chartConfig.areaD} fill="url(#areaGradient)" />

            {/* Line */}
            <path
              d={chartConfig.pathD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Data points */}
            {chartConfig.points.map((point, i) => (
              <g key={i}>
                <circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#2dd4af" strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity" />
                {/* Month labels */}
                <text
                  x={point.x}
                  y={chartConfig.marginTop + chartConfig.chartHeight + 18}
                  textAnchor="middle"
                  className="fill-slate-300"
                  fontFamily="system-ui"
                  fontSize="10"
                  fontWeight="500"
                >
                  {point.month}
                </text>
              </g>
            ))}

            {/* Active point (latest) */}
            {chartConfig.points.length >= 1 && (
              <circle
                cx={chartConfig.points[chartConfig.points.length - 1].x}
                cy={chartConfig.points[chartConfig.points.length - 1].y}
                r="5"
                fill="#2dd4af"
                stroke="white"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
};


export default RevenueChart;
