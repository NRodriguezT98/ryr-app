// Import específico individual
import CheckCircleIcon from 'lucide-react/dist/esm/icons/check-circle';
import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
import FolderOpenIcon from 'lucide-react/dist/esm/icons/folder-open';
import RotateCcwIcon from 'lucide-react/dist/esm/icons/rotate-ccw';
import EditIcon from 'lucide-react/dist/esm/icons/edit';
import React from 'react';

const TestImportEspecifico = () => {
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold text-green-800 mb-3">🔬 Test Import Específico</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">CheckCircle específico:</span>
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Calendar específico:</span>
          <CalendarIcon className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">FolderOpen específico:</span>
          <FolderOpenIcon className="w-5 h-5 text-purple-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">RotateCcw específico:</span>
          <RotateCcwIcon className="w-5 h-5 text-red-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Edit específico:</span>
          <EditIcon className="w-5 h-5 text-orange-600" />
        </div>
      </div>
    </div>
  );
};

export default TestImportEspecifico;