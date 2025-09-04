import React from 'react';

// 1. Importa todos los componentes de detalle específicos
import UpdateClienteDetails from './audit-details/UpdateClienteDetails';
import RenounceDetails from './audit-details/RenounceDetails';
import RestartProcessDetails from './audit-details/RestartProcessDetails';
import ArchiveDetails from './audit-details/ArchiveDetails';
import RestoreDetails from './audit-details/RestoreDetails';
import DeleteDetails from './audit-details/DeleteDetails';
import DefaultDetails from './audit-details/DefaultDetails';
import CreateViviendaDetails from './audit-details/CreateViviendaDetails';
import UpdateViviendaDetails from './audit-details/UpdateViviendaDetails';
import ArchiveViviendaDetails from './audit-details/ArchiveViviendaDetails';
import RestoreViviendaDetails from './audit-details/RestoreViviendaDetails';
import DeleteViviendaDetails from './audit-details/DeleteViviendaDetails';
import CreateClienteDetails from './audit-details/CreateClienteDetails'
import DetalleDesembolso from './audit-details/DetalleDesembolso';

// 2. Crea un mapa para asociar cada tipo de acción con su componente de vista
const ACTION_COMPONENTS = {
    'UPDATE_CLIENT': UpdateClienteDetails,
    'UPDATE_VIVIENDA': UpdateViviendaDetails,
    'CLIENT_RENOUNCE': RenounceDetails,
    'RESTART_CLIENT_PROCESS': RestartProcessDetails,
    'ARCHIVE_CLIENT': ArchiveDetails,
    'RESTORE_CLIENT': RestoreDetails,
    'DELETE_CLIENT_PERMANENTLY': DeleteDetails,
    'CREATE_VIVIENDA': CreateViviendaDetails,
    'ARCHIVE_VIVIENDA': ArchiveViviendaDetails,
    'RESTORE_VIVIENDA': RestoreViviendaDetails,
    'DELETE_VIVIENDA': DeleteViviendaDetails,
    'CREATE_CLIENT': CreateClienteDetails,
    'REGISTER_DISBURSEMENT': DetalleDesembolso,
    'REGISTER_CREDIT_DISBURSEMENT': DetalleDesembolso,

};

const AuditLogDetails = ({ log }) => {
    // Leemos la acción desde log.details.action.
    const action = log?.details?.action;

    const DetailsComponent = ACTION_COMPONENTS[action] || DefaultDetails;

    // Pasamos el 'log' completo al componente de detalle.
    return <DetailsComponent log={log} />;
};
export default AuditLogDetails;