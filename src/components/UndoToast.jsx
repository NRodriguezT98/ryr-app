import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, RotateCw } from 'lucide-react';

const UndoToast = ({ t, onUndo, message }) => {
    return (
        <div
            className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-10 w-10 text-orange-400" />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                            Eliminación en progreso
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {message}. Tienes 5 segundos para deshacer esta acción.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button
                    onClick={() => {
                        onUndo();
                        toast.dismiss(t.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <RotateCw className='h-4 w-4 mr-2' />
                    Deshacer
                </button>
            </div>
        </div>
    );
};

export default UndoToast;