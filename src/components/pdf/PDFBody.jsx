import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { formatCurrency, toTitleCase, formatID, formatDisplayDate } from "../../utils/textFormatters";
import { styles } from './PDFStyles'; // Importamos los estilos centralizados

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const PDFBody = ({ cliente, vivienda, historialAbonos, proyecto }) => {
    const fullName = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
    const totalAbonado = (historialAbonos || []).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = vivienda.valorFinal - totalAbonado;

    return (
        <>
            <View style={styles.twoColumn}>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Información del Cliente</Text>
                    <InfoRow label="Nombre" value={fullName} />
                    <InfoRow label="Cédula" value={formatID(cliente.datosCliente.cedula)} />
                    <InfoRow label="Correo" value={cliente.datosCliente.correo} />
                    <InfoRow label="Teléfono" value={cliente.datosCliente.telefono} />
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Información de la Vivienda</Text>
                    <InfoRow label="Vivienda Asignada" value={`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`} />
                    <InfoRow label="Proyecto" value={proyecto?.nombre || 'N/A'} />
                    <InfoRow label="Nomenclatura" value={vivienda.nomenclatura} />
                    <InfoRow label="Valor Base" value={formatCurrency(vivienda.valorBase)} />
                    <InfoRow label="Gastos Notariales" value={formatCurrency(vivienda.gastosNotariales)} />
                    <InfoRow label="Valor Total" value={formatCurrency(vivienda.valorFinal)} />
                    {cliente.financiero?.usaValorEscrituraDiferente && cliente.financiero?.valorEscritura > 0 && (
                        <InfoRow
                            label="Valor en Escritura"
                            value={`${formatCurrency(cliente.financiero.valorEscritura)} (Info.)`}
                        />
                    )}
                </View>
                {/* --- FIN DE LA SOLUCIÓN --- */}
            </View>

            <View style={styles.table} wrap={false}>
                <Text style={styles.sectionTitle}>Historial de Abonos</Text>
                <View style={styles.tableHeader} fixed>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>Fecha</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>Fuente de pago</Text>
                    <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>Monto</Text>
                    <Text style={[styles.tableCell, { flex: 2.5 }]}>Observación</Text>
                </View>
                {historialAbonos.length > 0 ? (
                    historialAbonos.map((abono, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 1.2 }]}>{formatDisplayDate(abono.fechaPago)}</Text>
                            <Text style={[styles.tableCell, { flex: 1.5 }]}>{abono.metodoPago || "N/A"}</Text>
                            <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>{formatCurrency(abono.monto)}</Text>
                            <Text style={[styles.tableCell, { flex: 2.5 }]}>{abono.observacion || ""}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ padding: 10 }}>No hay abonos registrados.</Text>
                )}
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Valor Total Vivienda:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(vivienda.valorFinal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Abonado:</Text>
                    <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{formatCurrency(totalAbonado)}</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 5, paddingTop: 5, borderTop: '1px solid #e5e7eb' }]}>
                    <Text style={[styles.summaryLabel, styles.summaryTotal]}>Saldo Pendiente:</Text>
                    <Text style={[styles.summaryValue, styles.summaryTotal]}>{formatCurrency(saldoPendiente)}</Text>
                </View>
            </View>
        </>
    );
};

export default PDFBody;