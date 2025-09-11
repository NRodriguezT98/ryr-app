// src/pages/clientes/components/TimelineSkeleton.jsx
import React from 'react';

const SkeletonCard = () => (
    <div className="py-2">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"></div>
            <div className="w-full p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

const TimelineSkeleton = () => {
    return (
        <div className="relative mt-6">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );
};

export default TimelineSkeleton;