import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from '../PDFHeader';
import PDFFooter from '../PDFFooter';
import { formatCurrency, toTitleCase } from '../../../utils/textFormatters';

const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", paddingTop: 40, paddingBottom: 80, paddingHorizontal: 40, fontSize: 10, lineHeight: 1.5, color: "#111827" },
    summarySection: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 6, marginBottom: 15 },
    header: { fontSize: 12, fontWeight: "bold", color: "#1f2937" },
    redText: { color: '#dc2626', fontWeight: 'bold' },
    tableHeader: { backgroundColor: "#c62529", color: "#ffffff", padding: 6, flexDirection: "row", fontWeight: "bold", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb", paddingVertical: 4, alignItems: 'center' },
    tableCell: { paddingHorizontal: 4 },
    tableFooter: { flexDirection: "row", borderTop: "2px solid #c62529", paddingVertical: 5, marginTop: 5 },
    emptyStateText: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic', marginTop: 10, padding: 10, backgroundColor: '#f9fafb', borderRadius: 4 },
    pagination: { position: "absolute", bottom: 30, right: 40, fontSize: 9, color: "#6b7280" }
});

const CarteraActivaPDF = ({ viviendasAsignadas, clientes }) => {
    const totalCartera = viviendasAsignadas.reduce((sum, v) => sum + (v.saldoPendiente || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                <PDFHeader title="Reporte de Cartera Activa" />
                <View style={styles.summarySection}>
                    <Text style={styles.header}>Total Cartera Pendiente: <Text style={styles.redText}>{formatCurrency(totalCartera)}</Text></Text>
                </View>
                {viviendasAsignadas.length > 0 ? (
                    <>
                        <View style={styles.tableHeader} fixed>
                            <Text style={[styles.tableCell, { flex: 0.5 }]}>#</Text>
                            <Text style={[styles.tableCell, { flex: 1.5 }]}>Vivienda</Text>
                            <Text style={[styles.tableCell, { flex: 2.5 }]}>Cliente</Text>
                            <Text style={[styles.tableCell, { flex: 1.5 }]}>Saldo Pendiente</Text>
                        </View>
                        {viviendasAsignadas.map((v, i) => (
                            <View key={i} style={styles.tableRow} wrap={false}>
                                <Text style={[styles.tableCell, { flex: 0.5 }]}>{i + 1}.</Text>
                                <Text style={[styles.tableCell, { flex: 1.5 }]}>{`Mz ${v.manzana} - C ${v.numeroCasa}`}</Text>
                                <Text style={[styles.tableCell, { flex: 2.5 }]}>{toTitleCase(v.clienteNombre)}</Text>
                                <Text style={[styles.tableCell, { flex: 1.5, color: '#dc2626' }]}>{formatCurrency(v.saldoPendiente)}</Text>
                            </View>
                        ))}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.tableCell, { flex: 5.5, textAlign: 'right', fontWeight: 'bold' }]}>Total de Registros:</Text>
                            <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold' }]}>{viviendasAsignadas.length}</Text>
                        </View>
                    </>
                ) : (
                    <Text style={styles.emptyStateText}>No hay cartera activa en este momento.</Text>
                )}
                <PDFFooter />
                <Text style={styles.pagination} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

export default CarteraActivaPDF;