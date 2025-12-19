/**
 * SATOSHINOSTR PROTOCOL V 1.0
 * Logic for Sovereign Debt Redemption
 */

function generarContrato() {
    // 1. Acceso a la instancia de jsPDF (Standard UMD version)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 2. Captura de datos de la UI
    const numNodo = document.getElementById('numeroContrato').value;
    const proclama = document.getElementById('proclama').value;
    const fecha = new Date().toLocaleString();

    // Validar que el número de nodo sea válido
    if (numNodo < 1 || numNodo > 500 || !numNodo) {
        alert("Please enter a valid Founder Node Number (1-500).");
        return;
    }

    // 3. Cálculo de la Curva de Escasez (Deflación Exponencial)
    // Formula: f(n) = 100 * 0.954^(n-1)
    const precio = 100 * Math.pow(0.954, numNodo - 1);

    // 4. Diseño del PDF (Estética Cypherpunk)
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); // Color Oro (#d4af37)
    doc.text("SATOSHINOSTR", 105, 40, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("SOVEREIGN DEBT REDEMPTION CONTRACT", 105, 50, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    // Contenido Técnico
    doc.setFontSize(12);
    doc.setFont("courier", "normal");
    doc.text(`Founder Node Number: ${numNodo} / 500`, 20, 70);
    doc.text(`Redemption Price: ${precio.toFixed(8)} BTC`, 20, 80);
    doc.text(`Timestamp: ${fecha}`, 20, 90);

    doc.setFont("courier", "italic");
    doc.text("Personal Proclamation of Independence:", 20, 110);
    
    // Ajuste automático de texto para la proclama
    const textLines = doc.splitTextToSize(proclama || "No proclamation provided. Silence is also sovereignty.", 170);
    doc.text(textLines, 20, 120);

    // Pie de página (