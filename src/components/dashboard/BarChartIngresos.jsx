import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatYAxis = (tickItem) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(tickItem);
};

const BarChartIngresos = ({ data }) => {
    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={formatYAxis} />
                    <Tooltip
                        formatter={(value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)}
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                    />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartIngresos;