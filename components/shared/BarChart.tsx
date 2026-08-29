
import React from 'react';

interface BarChartProps {
    data: { label: string; value: number; color: string }[];
    onClick?: (item: { label: string; value: number }) => void;
}

const BarChart: React.FC<BarChartProps> = ({ data, onClick }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="space-y-4 w-full">
            {data.map((item) => (
                <div 
                    key={item.label} 
                    className={onClick ? "cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors group" : ""}
                    onClick={() => onClick && onClick({ label: item.label, value: item.value })}
                    title={onClick ? `Filter by ${item.label}` : undefined}
                >
                    <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium text-gray-600 ${onClick ? "group-hover:text-indigo-600" : ""}`}>{item.label}</span>
                        <span className="text-gray-800 font-semibold">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ease-out ${onClick ? "group-hover:opacity-80" : ""}`}
                            style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
                        ></div>
                    </div>
                </div>
            ))}
            {data.length === 0 && <p className="text-gray-500 text-center text-sm">No data available</p>}
        </div>
    );
};

export default BarChart;
