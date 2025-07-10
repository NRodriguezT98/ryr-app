import React from 'react';

const ClienteCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="ml-4 w-full">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="pt-4 mt-4 border-t">
                    <div className="h-5 bg-gray-200 rounded-full w-2/5"></div>
                </div>
            </div>
        </div>
    );
};

export default ClienteCardSkeleton;