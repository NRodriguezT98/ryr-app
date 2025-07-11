import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast'; // <-- IMPORTACIÓN AÑADIDA
import logo1 from '../assets/logo1.png';

// Función para formatear moneda
const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

// Función principal para generar el PDF
export const generateClientStatementPDF = (cliente, vivienda, historialAbonos) => {
    // 1. Inicializar el documento PDF
    const doc = new jsPDF();

    // 2. Añadir el Encabezado
    doc.addImage(logo1, 'PNG', 14, 12, 40, 15);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("Estado de Cuenta", 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 200, 30, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(14, 35, 200, 35);

    // 3. Información del Cliente y Vivienda
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Información del Cliente", 14, 45);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`, 14, 52);
    doc.text(`Cédula: ${cliente.datosCliente.cedula}`, 14, 57);
    doc.text(`Teléfono: ${cliente.datosCliente.telefono}`, 105, 52);
    doc.text(`Correo: ${cliente.datosCliente.correo}`, 105, 57);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Información de la Vivienda", 14, 70);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Ubicación: Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`, 14, 77);
    doc.text(`Nomenclatura: ${vivienda.nomenclatura}`, 105, 77);

    // 4. Resumen Financiero
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Resumen Financiero", 14, 90);
    const summaryData = [
        ['Valor Final de la Vivienda:', formatCurrency(vivienda.valorFinal)],
        ['Total Abonado a la Fecha:', formatCurrency(vivienda.totalAbonado)],
        ['Saldo Pendiente:', formatCurrency(vivienda.saldoPendiente)],
    ];
    autoTable(doc, {
        body: summaryData,
        startY: 95,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold' },
        }
    });

    // 5. Tabla con Historial de Abonos
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    const tableStartY = doc.lastAutoTable.finalY + 15;
    doc.text("Historial de Abonos", 14, tableStartY);

    const tableColumn = ["Fecha", "Fuente de Pago", "Monto", "Observación"];
    const tableRows = [];

    historialAbonos.forEach(abono => {
        const abonoData = [
            new Date(abono.fechaPago + 'T00:00:00').toLocaleDateString('es-CO'),
            abono.metodoPago || 'N/A',
            formatCurrency(abono.monto),
            abono.observacion || ''
        ];
        tableRows.push(abonoData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY + 5,
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 9 },
    });

    // 6. Pie de Página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text("Constructora RyR - Reporte generado automáticamente", 14, 287);
    }

    // 7. Guardar el PDF
    doc.save(`Estado_Cuenta_${cliente.datosCliente.nombres.replace(' ', '_')}.pdf`);
    toast.success("Reporte PDF generado exitosamente.");
};