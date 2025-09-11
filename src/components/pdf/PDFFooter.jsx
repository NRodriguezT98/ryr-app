// src/components/pdf/PDFFooter.jsx (VERSIÓN REDISEÑADA)
import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import pieDePagina from "../../assets/pieDePagina.png";
import { styles } from "./PDFStyles"; // Importamos los estilos
import { formatCurrency } from "../../utils/textFormatters";

const PDFFooter = ({ vivienda, historialAbonos }) => {
    // 1. Calculamos los totales aquí, igual que antes en el Body
    const totalAbonado = (historialAbonos || []).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = vivienda.valorFinal - totalAbonado;

    return (
        // Usamos la prop 'fixed' para anclarlo al final de cada página
        <View style={styles.footer} fixed>
            {/* La imagen del pie de página se mantiene */}
            <Image src={pieDePagina} style={{ width: '100%' }} />
        </View>
    );
};

export default PDFFooter;