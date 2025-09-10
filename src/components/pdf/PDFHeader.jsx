import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import logo from '../../assets/logoRyR.png';
import { styles } from './PDFStyles'; // Importamos los estilos centralizados

const PDFHeader = () => {
    const fechaEmision = format(new Date(), "d 'de' MMMM, yyyy 'a las' h:mm:ss a", { locale: es });

    return (
        <View style={styles.header} fixed>
            <Image src={logo} style={styles.logo} />
            <View style={styles.headerInfo}>
                <Text style={styles.reportTitle}>Estado de Cuenta</Text>
                <Text style={styles.reportDate}>Emitido el: {fechaEmision}</Text>
            </View>
        </View>
    );
};

export default PDFHeader;