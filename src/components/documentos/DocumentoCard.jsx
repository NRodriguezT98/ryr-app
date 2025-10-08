import React from 'react';
import UniversalFileManager from '../UniversalFileManager';

const DocumentoCard = ({ label, isRequired, currentFileUrl, filePath, onUploadSuccess, onRemove }) => {

    if (!isRequired) {
        return null;
    }

    return (
        <UniversalFileManager
            variant="card"
            label={label}
            currentFileUrl={currentFileUrl}
            filePath={filePath}
            onUploadSuccess={onUploadSuccess}
            onDelete={onRemove}
            required={isRequired}
            showDownload={true}
            showPreview={true}
        />
    );
};

export default DocumentoCard;