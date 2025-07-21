import React from 'react';
import AnimatedPage from '../components/AnimatedPage';

const ResourcePageLayout = ({ title, icon, color, filterControls, children }) => {
    return (
        <AnimatedPage>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative">
                <div className="text-center mb-10">
                    <h2
                        className="text-4xl font-extrabold uppercase font-poppins inline-flex items-center gap-4"
                        style={{ color: color }}
                    >
                        {icon}
                        <span>{title}</span>
                    </h2>
                    <div
                        className="w-24 h-1 mx-auto rounded-full mt-2"
                        style={{ backgroundColor: color }}
                    ></div>
                </div>

                {filterControls && (
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        {filterControls}
                    </div>
                )}

                <div>
                    {children}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ResourcePageLayout;