import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    tableHeader: {
        backgroundColor: "#c62529",
        color: "#ffffff",
        padding: 6,
        flexDirection: "row",
        fontWeight: "bold",
        marginBottom: 4,
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: 4,
    },
});

const TableHeader = () => (
    <View style={styles.tableHeader} fixed>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fecha</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fuente de pago</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Monto</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>Observación</Text>
    </View>
);

export default TableHeader;
