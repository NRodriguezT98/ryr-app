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
        paddingBottom: 80,
        paddingHorizontal: 40,
        fontSize: 10,
        lineHeight: 1.5,
        color: "#111827",
        position: "relative"
    },
    pagination: {
        position: "absolute",
        bottom: 30,
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
                <PDFFooter />
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
