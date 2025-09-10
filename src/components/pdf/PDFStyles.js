// src/components/pdf/PDFStyles.js
import { StyleSheet, Font } from "@react-pdf/renderer";

// OPCIONAL: Registrar la fuente Inter si la descargaste (mejora la apariencia)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.woff2' });
// Font.register({ family: 'Inter', src: '/fonts/Inter-Bold.woff2', fontWeight: 'bold' });

export const styles = StyleSheet.create({
    // --- GENERAL ---
    page: {
        fontFamily: "Helvetica", // Cambia a 'Inter' si registras la fuente
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
        fontSize: 9,
        color: "#374151",
    },
    // --- HEADER ---
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerInfo: {
        textAlign: 'right',
    },
    logo: {
        width: 120,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    reportDate: {
        fontSize: 9,
        color: '#6b7280',
    },
    // --- BODY ---
    twoColumn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    column: {
        flex: 1,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#c62529',
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: 3,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    infoLabel: {
        fontWeight: 'bold',
        width: '35%',
    },
    infoValue: {
        width: '65%',
    },
    // --- TABLA ---
    table: {
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        color: 'white',
        padding: 5,
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #e5e7eb',
        padding: 5,
        // Añadimos esto para que las filas impares tengan un fondo sutil
        backgroundColor: '#f9fafb',
    },
    // Estilo para filas pares, para crear el efecto de "cebra"
    tableRowEven: {
        backgroundColor: 'white',
    },
    tableCell: {
        padding: 2, // Añadimos un poco de padding
    },
    // Nuevo estilo para alinear texto a la derecha
    textRight: {
        textAlign: 'right',
    },
    // --- RESUMEN ---
    summaryContainer: {
        marginTop: 20,
        paddingTop: 10,
        borderTop: '2px solid #c62529',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
    },
    summaryLabel: {
        width: '70%',
        textAlign: 'right',
        color: '#4b5563',
    },
    summaryValue: {
        width: '30%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    summaryTotal: {
        fontSize: 12,
        color: '#c62529',
    },
    // --- FOOTER ---
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
    },
    pagination: {
        position: "absolute",
        bottom: 30,
        right: 35,
        fontSize: 8,
        color: "#6b7280"
    }
});