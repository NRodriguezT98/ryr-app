import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

// Añadimos 'icon' como una nueva prop opcional
const Modal = ({ isOpen, onClose, title, children, icon }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors" aria-label="Cerrar modal">
                                    <X size={24} />
                                </button>

                                {/* --- ESTRUCTURA DE TÍTULO MEJORADA --- */}
                                <Dialog.Title as="div" className="flex items-center justify-center gap-3 text-center mb-6">
                                    {/* Renderizamos el ícono solo si se proporciona */}
                                    {icon}
                                    <h3 className="text-3xl font-extrabold text-gray-800">
                                        {title}
                                    </h3>
                                </Dialog.Title>

                                <div className="mt-2">
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default Modal;