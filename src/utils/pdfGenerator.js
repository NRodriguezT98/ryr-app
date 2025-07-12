import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { formatCurrency, toTitleCase, formatID } from './textFormatters';
import logo1 from '../assets/logo1.png';

export const generateClientStatementPDF = async (cliente, vivienda, historialAbonos) => {
    try {
        const doc = new jsPDF();

        // --- 1. Encabezado e Información del Cliente (Sin cambios) ---
        doc.addImage(logo1, 'PNG', 14, 12, 40, 15);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("Estado de Cuenta", doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, doc.internal.pageSize.getWidth() - 14, 30, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.line(14, 35, doc.internal.pageSize.getWidth() - 14, 35);

        const startYInfo = 45;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Información del Cliente", 14, startYInfo);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}`, 14, startYInfo + 7);
        doc.text(`Cédula: ${formatID(cliente.datosCliente.cedula)}`, 14, startYInfo + 14);
        doc.text(`Teléfono: ${cliente.datosCliente.telefono}`, 14, startYInfo + 21);
        doc.text(`Correo: ${cliente.datosCliente.correo}`, 14, startYInfo + 28);

        doc.setFont(undefined, 'bold');
        doc.text("Información de la Vivienda", 105, startYInfo);
        doc.setFont(undefined, 'normal');
        doc.text(`Ubicación: Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`, 105, startYInfo + 7);
        doc.text(`Nomenclatura: ${vivienda.nomenclatura}`, 105, startYInfo + 14);

        // --- 2. Historial de Abonos (Ahora se dibuja primero) ---
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Historial de Abonos", 14, 95);

        const tableColumn = ["Fecha", "Fuente de Pago", "Monto", "Observación"];
        const tableRows = [...historialAbonos]
            .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago))
            .map(abono => [
                new Date(abono.fechaPago + 'T00:00:00').toLocaleDateString('es-CO'),
                abono.metodoPago || 'N/A',
                formatCurrency(abono.monto),
                abono.observacion || ''
            ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 102, // Posición inicial fija para la tabla
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9, cellPadding: 2.5 },
        });

        // --- 3. Resumen Financiero (Ahora se dibuja al final) ---
        const summaryData = [
            ['Valor Vivienda:', formatCurrency(vivienda.valorFinal)],
            ['Total Abonado:', formatCurrency(vivienda.totalAbonado)],
            ['Saldo Pendiente:', formatCurrency(vivienda.saldoPendiente)],
        ];

        autoTable(doc, {
            body: summaryData,
            startY: doc.lastAutoTable.finalY + 10, // Se posiciona después de la tabla de abonos
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1 },
            columnStyles: {
                0: { fontStyle: 'bold', halign: 'right' },
                1: { fontStyle: 'bold', halign: 'right' },
            },
            tableWidth: 'wrap',
            margin: { left: doc.internal.pageSize.getWidth() - 95 }
        });

        // --- 4. Pie de página ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
            doc.text("Constructora RyR - Reporte generado automáticamente", 14, footerY);
        }

        // --- 5. Guardar el PDF ---
        doc.save(`Estado_Cuenta_${cliente.datosCliente.nombres.replace(/ /g, '_')}.pdf`);
        toast.success("Reporte PDF generado exitosamente.");

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        toast.error("No se pudo generar el reporte.");
    }
};