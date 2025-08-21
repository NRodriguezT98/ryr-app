import React, { useState, useEffect } from 'react';
import { PERMISSIONS_CONFIG } from '../../../utils/permissionsConfig';
import { Loader2 } from 'lucide-react';

const PermissionGroup = ({ module, actions, permissions, onPermissionChange }) => (
    <div className="py-4 border-b dark:border-gray-700">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{module.displayName}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {actions.map(action => (
                <label key={action.key} className="flex items-center space-x-2 text-sm">
                    <input
                        type="checkbox"
                        checked={permissions[module.module]?.[action.key] || false}
                        onChange={(e) => onPermissionChange(module.module, action.key, e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{action.displayName}</span>
                </label>
            ))}
        </div>
    </div>
);

const RoleForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre || '');
            setPermissions(initialData.permissions || {});
        } else {
            setNombre('');
            setPermissions({});
        }
    }, [initialData]);

    const handlePermissionChange = (module, action, value) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ id: initialData?.id, nombre, permissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium dark:text-gray-300">Nombre del Rol</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Ej: Auditor"
                    disabled={!!initialData?.id} // No se puede cambiar el nombre de un rol existente
                />
            </div>

            <div>
                <h3 className="text-lg font-bold dark:text-gray-100">Permisos</h3>
                {PERMISSIONS_CONFIG.map(module => (
                    <PermissionGroup
                        key={module.module}
                        module={module}
                        actions={module.actions}
                        permissions={permissions}
                        onPermissionChange={handlePermissionChange}
                    />
                ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
                </button>
            </div>
        </form>
    );
};

export default RoleForm;