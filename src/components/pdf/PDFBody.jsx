import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, toTitleCase, formatID } from "../../utils/textFormatters";

// Table Header
const TableHeader = () => (
    <View style={styles.tableHeader} fixed>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fecha</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fuente de pago</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Monto</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>Observación</Text>
    </View>
);

const styles = StyleSheet.create({
    section: { marginBottom: 15 },
    header: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#1f2937",
        borderBottom: "2px solid #c62529",
        paddingBottom: 4
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3
    },
    label: { fontWeight: "bold", width: "45%" },
    value: { width: "55%" },
    tableHeader: {
        backgroundColor: "#c62529",
        color: "#ffffff",
        padding: 6,
        flexDirection: "row",
        fontWeight: "bold",
        marginBottom: 4
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #c62529",
        paddingVertical: 4
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: 4
    },
    financialSummary: {
        backgroundColor: "#f3f4f6",
        padding: 10,
        borderRadius: 6,
        marginTop: 12
    },
    summaryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6
    },
    greenText: {
        color: "#16a34a",
        fontWeight: "bold"
    },
    redText: {
        color: "#dc2626",
        fontWeight: "bold"
    },
    bold: {
        fontWeight: "bold"
    }
});

const PDFBody = ({ cliente, vivienda, historialAbonos }) => {
    const fullName = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);

    const totalAbonadoCalculado = (historialAbonos || []).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendienteCalculado = vivienda.valorFinal - totalAbonadoCalculado;

    return (
        <>
            {/* Cliente */}
            <View style={styles.section}>
                <Text style={styles.header}>Información del Cliente</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.value}>{fullName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Cédula:</Text>
                    <Text style={styles.value}>{formatID(cliente.datosCliente.cedula)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Correo:</Text>
                    <Text style={styles.value}>{cliente.datosCliente.correo}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Teléfono:</Text>
                    <Text style={styles.value}>{cliente.datosCliente.telefono}</Text>
                </View>
            </View>

            {/* Vivienda */}
            <View style={styles.section}>
                <Text style={styles.header}>Información de la Vivienda</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Vivienda Asignada:</Text>
                    <Text style={[styles.value, styles.bold]}>Mz. {vivienda.manzana} - Casa {vivienda.numeroCasa}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Nomenclatura:</Text>
                    <Text style={styles.value}>{vivienda.nomenclatura}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Valor Base Vivienda:</Text>
                    <Text style={styles.value}>{formatCurrency(vivienda.valorBase)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Gastos Notariales:</Text>
                    <Text style={styles.value}>{formatCurrency(vivienda.gastosNotariales)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Valor Total Vivienda:</Text>
                    <Text style={[styles.value, styles.bold]}>{formatCurrency(vivienda.valorFinal)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Valor Registrado en Escritura:</Text>
                    <Text style={styles.value}>{`${formatCurrency(cliente.financiero.valorEscritura)} (Informativo)`}</Text>
                </View>
            </View>

            {/* Historial de abonos */}
            <View style={{ marginBottom: 15, breakInside: "avoid" }}>
                <Text style={styles.header}>Historial de Abonos</Text>
                <TableHeader />
                {historialAbonos.length > 0 ? (
                    historialAbonos.map((abono, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 1.2 }]}>{new Date(abono.fechaPago + "T00:00:00").toLocaleDateString("es-CO")}</Text>
                            <Text style={[styles.tableCell, { flex: 1.2 }]}>{abono.metodoPago || "N/A"}</Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>{formatCurrency(abono.monto)}</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{abono.observacion || ""}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ marginTop: 5 }}>No hay abonos registrados.</Text>
                )}
            </View>

            {/* Resumen financiero */}
            <View style={styles.financialSummary}>
                <Text style={styles.header}>Resumen Financiero</Text>
                <View style={styles.summaryItem}>
                    <Text>Valor Total Vivienda:</Text>
                    <Text style={styles.bold}>{formatCurrency(vivienda.valorFinal)}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text>Total Abonado a la fecha:</Text>
                    <Text style={styles.greenText}>{formatCurrency(totalAbonadoCalculado)}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text>Saldo Pendiente:</Text>
                    <Text style={styles.redText}>{formatCurrency(saldoPendienteCalculado)}</Text>
                </View>
            </View>
        </>
    );
};

export default PDFBody;
