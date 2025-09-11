import React from "react";
import { Document, Page, StyleSheet, Image, Text } from "@react-pdf/renderer";
import PDFHeader from "./PDFHeader";
import PDFBody from "./PDFBody";
import PDFFooter from "./PDFFooter";
import logo from "../../assets/logoRyR.png";
import pieDePagina from "../../assets/pieDePagina.png";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        paddingTop: 40,
        // --- INICIO DE LA SOLUCIÓN ---
        // Aumentamos el padding inferior para dejar espacio al footer
        paddingBottom: 100, // <-- AUMENTAMOS ESTE VALOR (ej: de 80 a 100)
        // --- FIN DE LA SOLUCIÓN ---
        paddingHorizontal: 40,
        fontSize: 10,
        lineHeight: 1.5,
        color: "#111827",
    },
    pagination: {
        position: "absolute",
        bottom: 30, // Este valor se mide desde el borde de la página
        right: 40,
        fontSize: 9,
        color: "#6b7280"
    }
});

const ClientPDF = ({ cliente, vivienda, historialAbonos, proyecto }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                <PDFHeader />
                <PDFBody
                    cliente={cliente}
                    vivienda={vivienda}
                    historialAbonos={historialAbonos}
                    proyecto={proyecto}
                />
                <PDFFooter
                    vivienda={vivienda}
                    historialAbonos={historialAbonos}
                />
                <Text
                    style={styles.pagination}
                    render={({ pageNumber, totalPages }) =>
                        `Página ${pageNumber} de ${totalPages}`
                    }
                    fixed
                />
            </Page>
        </Document>
    );
};

export default ClientPDF;
