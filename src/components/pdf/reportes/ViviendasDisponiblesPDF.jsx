import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from '../PDFHeader';
import PDFFooter from '../PDFFooter';
import { formatCurrency } from '../../../utils/textFormatters';

const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", paddingTop: 40, paddingBottom: 80, paddingHorizontal: 40, fontSize: 10, lineHeight: 1.5, color: "#111827" },
    tableHeader: { backgroundColor: "#c62529", color: "#ffffff", padding: 6, flexDirection: "row", fontWeight: "bold", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb", paddingVertical: 4, alignItems: 'center' },
    tableCell: { paddingHorizontal: 4 },
    tableFooter: { flexDirection: "row", borderTop: "2px solid #c62529", paddingVertical: 5, marginTop: 5 },
    emptyStateText: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic', marginTop: 10, padding: 10, backgroundColor: '#f9fafb', borderRadius: 4 },
    pagination: { position: "absolute", bottom: 30, right: 40, fontSize: 9, color: "#6b7280" }
});

const ViviendasDisponiblesPDF = ({ viviendas }) => (
    <Document>
        <Page size="A4" style={styles.page} wrap>
            <PDFHeader title="Reporte de Viviendas Disponibles" />
            {viviendas.length > 0 ? (
                <>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.tableCell, { flex: 0.5 }]}>#</Text>
                        <Text style={[styles.tableCell, { flex: 2 }]}>Ubicación</Text>
                        <Text style={[styles.tableCell, { flex: 1.5 }]}>Valor</Text>
                    </View>
                    {viviendas.map((v, i) => (
                        <View key={i} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.tableCell, { flex: 0.5 }]}>{i + 1}.</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{`Mz ${v.manzana} - Casa ${v.numeroCasa}`}</Text>
                            <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrency(v.valorFinal)}</Text>
                        </View>
                    ))}
                    <View style={styles.tableFooter}>
                        <Text style={[styles.tableCell, { flex: 3.5, textAlign: 'right', fontWeight: 'bold' }]}>Total Disponibles:</Text>
                        <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold' }]}>{viviendas.length}</Text>
                    </View>
                </>
            ) : (
                <Text style={styles.emptyStateText}>No hay viviendas disponibles en este momento.</Text>
            )}
            <PDFFooter />
            <Text style={styles.pagination} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
        </Page>
    </Document>
);

export default ViviendasDisponiblesPDF;