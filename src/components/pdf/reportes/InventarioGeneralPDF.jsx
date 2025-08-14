import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from '../PDFHeader';
import PDFFooter from '../PDFFooter';
import { formatCurrency, toTitleCase } from '../../../utils/textFormatters';

const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", paddingTop: 40, paddingBottom: 80, paddingHorizontal: 40, fontSize: 10, lineHeight: 1.5, color: "#111827" },
    summarySection: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 6, marginBottom: 20 },
    header: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#1f2937", borderBottom: "2px solid #c62529", paddingBottom: 4 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 11 },
    label: { fontWeight: "bold" },
    yellowText: { color: '#f59e0b', fontWeight: 'bold' },
    blueText: { color: '#3b82f6', fontWeight: 'bold' },
    greenText: { color: '#16a34a', fontWeight: 'bold' },
    bold: { fontWeight: 'bold' },
    tableHeader: { backgroundColor: "#c62529", color: "#ffffff", padding: 6, flexDirection: "row", fontWeight: "bold", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb", paddingVertical: 4, alignItems: 'center' },
    tableCell: { paddingHorizontal: 4 },
    tableFooter: { flexDirection: "row", borderTop: "2px solid #c62529", paddingVertical: 5, marginTop: 5 },
    emptyStateText: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic', marginTop: 10, padding: 10, backgroundColor: '#f9fafb', borderRadius: 4 },
    pagination: { position: "absolute", bottom: 30, right: 40, fontSize: 9, color: "#6b7280" }
});

const InventarioGeneralPDF = ({ viviendas }) => {
    const disponibles = viviendas.filter(v => !v.clienteId);
    const asignadas = viviendas.filter(v => v.clienteId && v.saldoPendiente > 0);
    const pagadas = viviendas.filter(v => v.clienteId && v.saldoPendiente <= 0);
    const valorTotalInventario = viviendas.reduce((sum, v) => sum + v.valorFinal, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                <PDFHeader title="Reporte General de Inventario" />

                <View style={styles.summarySection}>
                    <Text style={styles.header}>Resumen General</Text>
                    <View style={styles.row}><Text style={styles.label}>Total de Viviendas:</Text><Text style={styles.bold}>{viviendas.length}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Disponibles:</Text><Text style={styles.yellowText}>{disponibles.length}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Asignadas (Pendientes):</Text><Text style={styles.blueText}>{asignadas.length}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Pagadas:</Text><Text style={styles.greenText}>{pagadas.length}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Valor Total del Inventario:</Text><Text style={styles.bold}>{formatCurrency(valorTotalInventario)}</Text></View>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.header}>Viviendas Disponibles</Text>
                    {disponibles.length > 0 ? (
                        <>
                            <View style={styles.tableHeader} fixed>
                                <Text style={[styles.tableCell, { flex: 0.5 }]}>#</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>Ubicación</Text>
                                <Text style={[styles.tableCell, { flex: 1.5 }]}>Valor</Text>
                            </View>
                            {disponibles.map((v, i) => (
                                <View key={i} style={styles.tableRow} wrap={false}>
                                    <Text style={[styles.tableCell, { flex: 0.5 }]}>{i + 1}.</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{`Mz ${v.manzana} - Casa ${v.numeroCasa}`}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrency(v.valorFinal)}</Text>
                                </View>
                            ))}
                            <View style={styles.tableFooter}>
                                <Text style={[styles.tableCell, { flex: 3.5, textAlign: 'right', fontWeight: 'bold' }]}>Total Disponibles:</Text>
                                <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold' }]}>{disponibles.length}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.emptyStateText}>No hay viviendas disponibles en este momento.</Text>
                    )}
                </View>

                <View style={{ marginBottom: 15 }} break={disponibles.length > 10}>
                    <Text style={styles.header}>Viviendas Asignadas y Pagadas</Text>
                    {asignadas.length > 0 || pagadas.length > 0 ? (
                        <>
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            <View style={styles.tableHeader} fixed>
                                <Text style={[styles.tableCell, { flex: 0.4 }]}>#</Text>
                                <Text style={[styles.tableCell, { flex: 1.5 }]}>Ubicación</Text>
                                <Text style={[styles.tableCell, { flex: 2.5 }]}>Cliente Asignado</Text>
                                <Text style={[styles.tableCell, { flex: 1 }]}>Estado</Text>
                                <Text style={[styles.tableCell, { flex: 1.5 }]}>Valor</Text>
                            </View>
                            {asignadas.map((v, i) => (
                                <View key={i} style={styles.tableRow} wrap={false}>
                                    <Text style={[styles.tableCell, { flex: 0.4 }]}>{i + 1}.</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{`Mz ${v.manzana} - Casa ${v.numeroCasa}`}</Text>
                                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{toTitleCase(v.clienteNombre)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, color: '#3b82f6' }]}>Asignada</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrency(v.valorFinal)}</Text>
                                </View>
                            ))}
                            {pagadas.map((v, i) => (
                                <View key={i + asignadas.length} style={styles.tableRow} wrap={false}>
                                    <Text style={[styles.tableCell, { flex: 0.4 }]}>{i + 1 + asignadas.length}.</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{`Mz ${v.manzana} - Casa ${v.numeroCasa}`}</Text>
                                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{toTitleCase(v.clienteNombre)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, color: '#16a34a' }]}>Pagada</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrency(v.valorFinal)}</Text>
                                </View>
                            ))}
                            <View style={styles.tableFooter}>
                                <Text style={[styles.tableCell, { flex: 6.4, textAlign: 'right', fontWeight: 'bold' }]}>Total Asignadas/Pagadas:</Text>
                                <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold' }]}>{asignadas.length + pagadas.length}</Text>
                            </View>
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                        </>
                    ) : (
                        <Text style={styles.emptyStateText}>No hay viviendas asignadas o pagadas en este momento.</Text>
                    )}
                </View>

                <PDFFooter />
                <Text style={styles.pagination} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

export default InventarioGeneralPDF;