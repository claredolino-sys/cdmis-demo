
import React from 'react';

interface PieChartProps {
  data: { name: string; value: number }[];
  onClick?: (item: { name: string; value: number }) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const PieChart: React.FC<PieChartProps> = ({ data, onClick }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  if (total === 0) {
    return <div className="text-center p-4 text-gray-400">No data to display.</div>;
  }

  const slices = data.map((item, index) => {
    const startAngle = (cumulative / total) * 360;
    const endAngle = ((cumulative + item.value) / total) * 360;
    const angleSpan = endAngle - startAngle;
    cumulative += item.value;

    // Calculate path coordinates (start from -90deg / 12 o'clock)
    const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
    const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
    const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
    const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

    const largeArcFlag = angleSpan > 180 ? 1 : 0;

    // Handle full circle case
    const pathD = angleSpan >= 360 
        ? `M 50, 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0`
        : `M50,50 L${x1},${y1} A40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;

    // Calculate text position (centroid)
    const midAngle = startAngle + angleSpan / 2;
    const textRadius = 25; // Position text at distance 25 from center
    const tx = 50 + textRadius * Math.cos(Math.PI * (midAngle - 90) / 180);
    const ty = 50 + textRadius * Math.sin(Math.PI * (midAngle - 90) / 180);

    return {
      ...item,
      pathD,
      tx,
      ty,
      fill: COLORS[index % COLORS.length],
      showText: angleSpan > 10 // Only show text for slices > 10 degrees
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <svg viewBox="0 0 100 100" className="w-48 h-48 overflow-visible">
        {slices.map((slice, index) => (
          <g 
            key={`group-${index}`} 
            onClick={() => onClick && onClick({ name: slice.name, value: slice.value })}
            className={onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
          >
            <path 
                d={slice.pathD} 
                fill={slice.fill} 
                stroke="white" 
                strokeWidth="1" 
            />
            {slice.showText && (
                <text
                x={slice.tx}
                y={slice.ty}
                fill="white"
                fontSize="5"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.4)' }}
                className="pointer-events-none select-none"
                >
                {slice.value}
                </text>
            )}
            <title>{`${slice.name}: ${slice.value}`}</title>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-4 justify-center">
        {slices.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center ${onClick ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors' : ''}`}
            onClick={() => onClick && onClick({ name: item.name, value: item.value })}
          >
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-gray-600 font-medium">{`${item.name}: ${item.value}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
