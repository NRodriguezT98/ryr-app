// src/pages/admin/audit-details/components/DetailRow.jsx

import React from 'react';

const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

export default DetailRow;