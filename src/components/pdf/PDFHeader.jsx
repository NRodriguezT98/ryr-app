import React from "react";
import { Image, StyleSheet, Text } from "@react-pdf/renderer";
import logo from "../../assets/logoRyR.png";

const styles = StyleSheet.create({
    logo: {
        width: 150,
        alignSelf: "center",
        marginBottom: 10
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10
    },
    dateText: {
        textAlign: "center",
        marginBottom: 20
    }
});

// --- INICIO DE LA MODIFICACIÓN ---
// El componente ahora acepta un 'title' como prop.
const PDFHeader = ({ title = "Estado de Cuenta" }) => {
    // --- FIN DE LA MODIFICACIÓN ---
    const fechaActual = new Date().toLocaleDateString("es-CO");
    return (
        <>
            <Image src={logo} style={styles.logo} fixed />
            {/* Se usa el 'title' recibido */}
            <Text style={styles.title} fixed>{title}</Text>
            <Text style={styles.dateText} fixed>Fecha de emisión: {fechaActual}</Text>
        </>
    );
};

export default PDFHeader;