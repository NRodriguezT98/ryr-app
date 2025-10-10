import React from 'react';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Loader2,
    X,
    Copy,
    Download,
    Edit3,
    Trash2,
    Plus,
    Eye
} from 'lucide-react';

const ModernToast = ({
    t,
    type = 'info',
    title,
    message,
    action,
    actionIcon,
    onAction,
    onDismiss,
    duration = 4000
}) => {
    const getToastConfig = () => {
        const configs = {
            success: {
                icon: CheckCircle2,
                iconColor: 'text-emerald-500 dark:text-emerald-400',
                borderColor: 'border-l-emerald-500',
                bgGradient: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50',
                actionColor: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300'
            },
            error: {
                icon: XCircle,
                iconColor: 'text-red-500 dark:text-red-400',
                borderColor: 'border-l-red-500',
                bgGradient: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50',
                actionColor: 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-800/60 dark:text-red-300'
            },
            warning: {
                icon: AlertTriangle,
                iconColor: 'text-amber-500 dark:text-amber-400',
                borderColor: 'border-l-amber-500',
                bgGradient: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50',
                actionColor: 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-800/60 dark:text-amber-300'
            },
            info: {
                icon: Info,
                iconColor: 'text-blue-500 dark:text-blue-400',
                borderColor: 'border-l-blue-500',
                bgGradient: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
                actionColor: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:hover:bg-blue-800/60 dark:text-blue-300'
            },
            loading: {
                icon: Loader2,
                iconColor: 'text-gray-500 dark:text-gray-400 animate-spin',
                borderColor: 'border-l-gray-500',
                bgGradient: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50',
                actionColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800/60 dark:text-gray-300'
            }
        };
        return configs[type] || configs.info;
    };

    const getActionIcon = () => {
        const icons = {
            copy: Copy,
            download: Download,
            edit: Edit3,
            delete: Trash2,
            add: Plus,
            view: Eye
        };
        return icons[actionIcon] || Copy;
    };

    const config = getToastConfig();
    const IconComponent = config.icon;
    const ActionIcon = getActionIcon();

    return (
        <div
            className={`
                ${t.visible ? 'animate-slide-in-right' : 'animate-slide-out-right'}
                max-w-md w-full ${config.bgGradient} backdrop-blur-sm
                shadow-xl shadow-black/10 dark:shadow-black/30
                rounded-xl pointer-events-auto 
                ring-1 ring-black/5 dark:ring-white/10
                border ${config.borderColor} border-l-4
                overflow-hidden transform transition-all duration-300
                hover:scale-[1.02] hover:shadow-2xl
            `}
        >
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-0.5">
                        <IconComponent
                            className={`h-5 w-5 ${config.iconColor} drop-shadow-sm`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {title && (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                                {title}
                            </p>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {message}
                        </p>

                        {action && onAction && (
                            <div className="mt-3 flex items-center space-x-2">
                                <button
                                    type="button"
                                    className={`
                                        inline-flex items-center px-3 py-1.5 
                                        border border-transparent text-xs font-medium rounded-lg
                                        ${config.actionColor}
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
                                        transform transition-all duration-200 hover:scale-105
                                        shadow-sm hover:shadow-md
                                    `}
                                    onClick={onAction}
                                >
                                    <ActionIcon className="mr-1.5 h-3.5 w-3.5" />
                                    {action}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        <button
                            className="
                                rounded-lg p-1.5 inline-flex items-center justify-center
                                text-gray-400 dark:text-gray-500 
                                hover:text-gray-500 dark:hover:text-gray-400
                                hover:bg-gray-100 dark:hover:bg-gray-800/50
                                focus:outline-none focus:ring-2 focus:ring-current
                                transition-all duration-200 hover:scale-110
                            "
                            onClick={onDismiss || (() => toast.dismiss(t.id))}
                        >
                            <span className="sr-only">Cerrar</span>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Barra de progreso para duración */}
            {type !== 'loading' && duration && duration > 0 && (
                <div className="h-1 bg-gray-200/50 dark:bg-gray-700/50">
                    <div
                        className={`h-full ${config.borderColor.replace('border-l-', 'bg-')} 
                                   animate-progress-bar opacity-60`}
                        style={{
                            animation: `progress-bar ${duration}ms linear forwards`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ModernToast;