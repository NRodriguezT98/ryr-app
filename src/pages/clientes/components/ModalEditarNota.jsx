// src/pages/clientes/components/ModalEditarNota.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Edit } from 'lucide-react';
import { useModernToast } from '../../../hooks/useModernToast.jsx';

const ModalEditarNota = ({ isOpen, onClose, onSave, notaAEditar }) => {
    const [texto, setTexto] = useState('');
    const toast = useModernToast();

    useEffect(() => {
        if (notaAEditar) {
            setTexto(notaAEditar.details?.nota || '');
        }
    }, [notaAEditar]);

    const handleSave = () => {
        if (texto.trim().length < 10) {
            toast.error("La nota debe tener al menos 10 caracteres.", {
                title: "Nota Muy Corta"
            });
            return;
        }
        // Comparamos con el texto original que está en details.nota
        if (notaAEditar && texto.trim() === notaAEditar.details?.nota.trim()) {
            toast.warning("No has realizado ningún cambio en la nota.", {
                title: "Sin Cambios"
            });
            return;
        }
        onSave(texto);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Nota del Historial"
            icon={<Edit size={24} className="text-blue-500" />}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="nota-historial-edit" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                        Contenido de la nota
                    </label>
                    <textarea
                        id="nota-historial-edit"
                        rows="5"
                        className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Revisar Cambios</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalEditarNota;