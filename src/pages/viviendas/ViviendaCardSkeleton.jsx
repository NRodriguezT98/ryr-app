import React from 'react';

const ViviendaCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="pt-4 mt-4 border-t">
                    <div className="h-2.5 bg-gray-300 rounded-full w-full mb-2"></div>
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
                <div className="pt-4 mt-4 border-t flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded w-2/5"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ViviendaCardSkeleton;