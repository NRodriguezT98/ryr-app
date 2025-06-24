import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-blue-500' }) => {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center">
            <div className={`text-4xl mr-5 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-bold text-gray-800">{value}</div>
                <p className="text-gray-500">{title}</p>
            </div>
        </div>
    );
};

export default StatCard;