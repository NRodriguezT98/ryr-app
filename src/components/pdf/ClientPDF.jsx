import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image
} from "@react-pdf/renderer";

import logo from "../../assets/logoRyR.png";
import pieDePagina from "../../assets/pieDePagina.png";
import { formatCurrency, toTitleCase, formatID } from "../../utils/textFormatters";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        padding: 40,
        fontSize: 10,
        lineHeight: 1.5,
        color: "#111827",
        position: "relative"
    },
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
    section: {
        marginBottom: 15
    },
    sectionAbonos: {
        marginBottom: 15,
        paddingBottom: 60 // Evita colisión con pie de página
    },
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
    label: {
        fontWeight: "bold",
        width: "45%"
    },
    value: {
        width: "55%"
    },
    tableHeader: {
        backgroundColor: "#c62529",
        color: "#ffffff",
        padding: 6,
        flexDirection: "row",
        fontWeight: "bold"
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
    },
    footerImage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%"
    },
    pagination: {
        position: "absolute",
        bottom: 30,
        right: 40,
        fontSize: 9,
        color: "#6b7280"
    }
});

const ClientPDF = ({ cliente, vivienda, historialAbonos }) => {
    const fullName = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
    const fechaActual = new Date().toLocaleDateString("es-CO");

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image src={logo} style={styles.logo} fixed />
                <Text style={styles.title}>Estado de Cuenta</Text>
                <Text style={{ textAlign: "center", marginBottom: 20 }}>
                    Fecha de emisión: {fechaActual}
                </Text>

                {/* Información del cliente */}
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

                {/* Información de la vivienda */}
                <View style={styles.section}>
                    <Text style={styles.header}>Información de la Vivienda</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Vivienda Asignada:</Text>
                        <Text style={[styles.value, styles.bold]}>
                            Mz. {vivienda.manzana} - Casa {vivienda.numeroCasa}
                        </Text>
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
                        <Text style={[styles.value, styles.bold]}>
                            {formatCurrency(vivienda.valorFinal)}
                        </Text>
                    </View>
                </View>

                {/* Historial de abonos */}
                <View style={styles.sectionAbonos}>
                    <Text style={styles.header}>Historial de Abonos</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fecha</Text>
                        <Text style={[styles.tableCell, { flex: 1.2 }]}>Fuente de pago</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}>Monto</Text>
                        <Text style={[styles.tableCell, { flex: 2 }]}>Observación</Text>
                    </View>
                    {historialAbonos?.length > 0 ? (
                        historialAbonos.map((abono, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                                    {new Date(abono.fechaPago + "T00:00:00").toLocaleDateString("es-CO")}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                                    {abono.metodoPago || "N/A"}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 1 }]}>
                                    {formatCurrency(abono.monto)}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>
                                    {abono.observacion || ""}
                                </Text>
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
                        <Text style={styles.greenText}>{formatCurrency(vivienda.totalAbonado)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text>Saldo Pendiente:</Text>
                        <Text style={styles.redText}>{formatCurrency(vivienda.saldoPendiente)}</Text>
                    </View>
                </View>

                {/* Pie de página e información */}
                <Image src={pieDePagina} style={styles.footerImage} fixed />

                {/* Paginación */}
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
