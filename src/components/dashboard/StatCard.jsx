import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-blue-500' }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex items-center">
            <div className={`text-4xl mr-5 ${colorClass}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 break-words">
                    {value}
                </div>
                <p className="text-gray-500 dark:text-gray-400">{title}</p>
            </div>
        </div>
    );
};

export default StatCard;