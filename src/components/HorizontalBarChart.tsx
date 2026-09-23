import React, { useId } from 'react';

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  items: BarChartItem[];
  title?: string;
  id?: string;
  maxCustomVal?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  title,
  id,
  maxCustomVal,
}) => {
  const generatedId = useId();
  const chartId = id || `chart-${generatedId}`;

  // Find max value to determine nice scale
  const rawMax = Math.max(...items.map((i) => i.value), 10);
  const maxVal = maxCustomVal || (rawMax <= 25 ? 25 : rawMax <= 60 ? 60 : Math.ceil(rawMax / 10) * 10);
  
  // Ticks
  const tickCount = maxVal <= 30 ? 5 : 6;
  const tickStep = maxVal / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, idx) => Math.round(idx * tickStep));

  // SVG dimensions
  const width = 680;
  const height = items.length * 48 + 50;
  const marginLeft = 150;
  const marginRight = 50;
  const marginTop = 20;
  const marginBottom = 30;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const rowHeight = plotHeight / items.length;
  const barHeight = 18;

  return (
    <div className="w-full my-3 flex flex-col items-center select-none">
      {title && (
        <div className="text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">
          {title}
        </div>
      )}
      <div className="w-full overflow-x-auto flex justify-center bg-white border border-slate-200 rounded p-2">
        <svg
          id={chartId}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[680px] h-auto font-sans"
          style={{ maxHeight: `${height}px` }}
        >
          {/* Background gridlines */}
          {ticks.map((tick) => {
            const x = marginLeft + (tick / maxVal) * plotWidth;
            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={x}
                  y1={marginTop}
                  x2={x}
                  y2={height - marginBottom}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - marginBottom + 16}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="12"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Baseline X Axis */}
          <line
            x1={marginLeft}
            y1={height - marginBottom}
            x2={width - marginRight}
            y2={height - marginBottom}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Y Axis */}
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={height - marginBottom}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Bars */}
          {items.map((item, index) => {
            const yCenter = marginTop + index * rowHeight + rowHeight / 2;
            const barW = Math.max((item.value / maxVal) * plotWidth, item.value > 0 ? 3 : 0);
            const barColor = item.color || '#5b9bd5';

            return (
              <g key={`bar-${index}`}>
                {/* Y-axis Label */}
                <text
                  x={marginLeft - 12}
                  y={yCenter + 4}
                  textAnchor="end"
                  fill="#334155"
                  fontSize="12"
                  fontWeight="400"
                >
                  {item.label}
                </text>

                {/* Horizontal bar */}
                {barW > 0 && (
                  <rect
                    x={marginLeft}
                    y={yCenter - barHeight / 2}
                    width={barW}
                    height={barHeight}
                    fill={barColor}
                    rx="1"
                  />
                )}

                {/* Value number label at end of bar */}
                <text
                  x={marginLeft + barW + 8}
                  y={yCenter + 4}
                  textAnchor="start"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="700"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
