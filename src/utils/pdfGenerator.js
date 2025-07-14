import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { formatCurrency, toTitleCase, formatID } from './textFormatters';
import logoRyR from '../assets/logoRyR.png';
import pieDePagina from '../assets/pieDePagina.png';

// Función para obtener dimensiones de una imagen (sin cambios)
const getImageDimensions = (imageSrc) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = (err) => reject(err);
        img.src = imageSrc;
    });
};

export const generateClientStatementPDF = async (cliente, vivienda, historialAbonos) => {
    try {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- 1. Cargar y dibujar Logo y Pie de Página ---
        const [originalLogo, footerImage] = await Promise.all([
            getImageDimensions(logoRyR),
            getImageDimensions(pieDePagina)
        ]);
        const logoWidthInPdf = 50;
        const logoHeightInPdf = (originalLogo.height * logoWidthInPdf) / originalLogo.width;
        doc.addImage(logoRyR, 'PNG', 14, 15, logoWidthInPdf, logoHeightInPdf);

        const footerWidthInPdf = pageWidth;
        const footerHeightInPdf = (footerImage.height * footerWidthInPdf) / footerImage.width;

        // --- 2. Contenido del Encabezado ---
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("Estado de Cuenta", pageWidth / 2, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - 14, 25, { align: 'right' });

        let currentY = 55;
        doc.setLineWidth(0.5);
        doc.line(14, currentY, pageWidth - 14, currentY);
        currentY += 15;

        // --- 3. Información del Cliente y Vivienda ---
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Información del Cliente", 14, currentY);
        doc.text("Información de la Vivienda", 105, currentY);
        currentY += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}`, 14, currentY);
        doc.text(`Ubicación: Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`, 105, currentY);
        currentY += 7;
        doc.text(`Cédula: ${formatID(cliente.datosCliente.cedula)}`, 14, currentY);
        doc.text(`Nomenclatura: ${vivienda.nomenclatura}`, 105, currentY);
        currentY += 7;
        doc.text(`Teléfono: ${cliente.datosCliente.telefono}`, 14, currentY);
        currentY += 7;
        doc.text(`Correo: ${cliente.datosCliente.correo}`, 14, currentY);

        // --- 4. Historial de Abonos ---
        currentY += 20;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Historial de Abonos", 14, currentY);

        const tableColumn = ["Fecha", "Fuente de Pago", "Monto", "Observación"];
        const tableRows = [...historialAbonos].sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago)).map(abono => [new Date(abono.fechaPago + 'T00:00:00').toLocaleDateString('es-CO'), abono.metodoPago || 'N/A', formatCurrency(abono.monto), abono.observacion || '']);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: currentY + 7,
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9, cellPadding: 2.5 },
        });

        // --- 5. TABLA DE RESUMEN FINAL UNIFICADA ---
        const summaryBody = [];

        // Sección de Desglose del Valor
        summaryBody.push([{ content: 'Desglose del Valor', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#374151', textColor: '#FFFFFF' } }]);
        summaryBody.push(['Valor Base:', formatCurrency(vivienda.valorBase || 0)]);
        if (vivienda.recargoEsquinera > 0) {
            summaryBody.push(['Recargo Esquinera:', formatCurrency(vivienda.recargoEsquinera)]);
        }
        if (vivienda.gastosNotariales > 0) {
            summaryBody.push(['G. Notariales:', formatCurrency(vivienda.gastosNotariales)]);
        }

        // Espaciador Limpio
        summaryBody.push([{ content: '', colSpan: 2, styles: { fillColor: '#FFFFFF', minCellHeight: 0 } }]);

        // Sección de Totales
        summaryBody.push(['Valor Total Vivienda:', { content: formatCurrency(vivienda.valorFinal), styles: { fontStyle: 'bold' } }]);
        summaryBody.push(['Total Abonado:', { content: formatCurrency(vivienda.totalAbonado), styles: { fontStyle: 'bold', textColor: '#16a34a' } }]);
        summaryBody.push(['Saldo Pendiente:', { content: formatCurrency(vivienda.saldoPendiente), styles: { fontStyle: 'bold', textColor: '#dc2626' } }]);

        autoTable(doc, {
            body: summaryBody,
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { fontStyle: 'bold', halign: 'right' },
                1: { halign: 'right' }
            },
            tableWidth: 'wrap',
            margin: { left: 105 } // Se alinea a la derecha
        });

        // --- 6. Pie de Página ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.addImage(pieDePagina, 'PNG', 0, pageHeight - footerHeightInPdf, footerWidthInPdf, footerHeightInPdf);
        }

        // --- 7. Guardar el PDF ---
        doc.save(`Estado_Cuenta_${cliente.datosCliente.nombres.replace(/ /g, '_')}.pdf`);
        toast.success("Reporte PDF generado exitosamente.");

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        toast.error("No se pudo generar el reporte.");
    }
};