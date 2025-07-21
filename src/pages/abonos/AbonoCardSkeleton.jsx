import React from 'react';

const AbonoCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full w-12 h-12"></div>
                <div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24 mt-2"></div>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-grow pl-0 sm:pl-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    );
};

export default AbonoCardSkeleton;