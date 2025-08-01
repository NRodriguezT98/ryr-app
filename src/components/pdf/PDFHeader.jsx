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

const PDFHeader = () => {
    const fechaActual = new Date().toLocaleDateString("es-CO");
    return (
        <>
            <Image src={logo} style={styles.logo} fixed />
            <Text style={styles.title} fixed>Estado de Cuenta</Text>
            <Text style={styles.dateText} fixed>Fecha de emisión: {fechaActual}</Text>
        </>
    );
};

export default PDFHeader;
