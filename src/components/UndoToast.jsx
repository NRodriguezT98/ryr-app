import React from 'react';
import toast from 'react-hot-toast';
import ModernToast from './ModernToast';

const UndoToast = ({ t, onUndo, message }) => {
    return (
        <ModernToast
            t={t}
            type="warning"
            title="Eliminación en progreso"
            message={`${message}. Tienes 5 segundos para deshacer esta acción.`}
            action="Deshacer"
            actionIcon="copy"
            onAction={() => {
                onUndo();
                toast.dismiss(t.id);
            }}
            onDismiss={() => toast.dismiss(t.id)}
            duration={5000}
        />
    );
};

export default UndoToast;