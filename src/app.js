/**
 * SATOSHINOSTR PROTOCOL - Final Sovereign Logic
 */

function generarContrato() {
    // 1. Inicializar PDF (Versión UMD compatible con tu script del index)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 2. Capturar elementos EXACTOS de tu HTML
    const inputNodo = document.getElementById('numeroContrato');
    const inputProclama = document.getElementById('proclama');
    
    const numNodo = inputNodo.value;
    const proclama = inputProclama.value;
    const fecha = new Date().toLocaleString();

    // 3. Validación de seguridad
    if (!numNodo || numNodo < 1 || numNodo > 500) {
        alert("Please enter a valid Node Number (1-500).");
        return;
    }

    // 4. Cálculo de la curva de escasez
    const precio = 100 * Math.pow(0.954, numNodo - 1);

    // 5. Generación estética del PDF
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); 
    doc.text("SATOSHINOSTR", 105, 40, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("SOVEREIGN DEBT REDEMPTION CONTRACT", 105, 50, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    doc.setFontSize(12);
    doc.setFont("courier", "normal");
    doc.text(`Founder Node Number: ${numNodo} / 500`, 20, 70);
    doc.text(`Redemption Price: ${precio.toFixed(8)} BTC`, 20, 80);
    doc.text(`Timestamp: ${fecha}`, 20, 90);

    doc.setFont("courier", "italic");
    doc.text("Proclamation of Independence:", 20, 110);
    const textLines = doc.splitTextToSize(proclama || "No proclamation provided.", 170);
    doc.text(textLines, 20, 120);

    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.text("Don't Trust. Verify.", 105, 260, { align: "center" });

    // 6. Descarga inmediata
    doc.save(`SatoshiNostr_Contract_${numNodo}.pdf`);
}

// Lógica para que el PRECIO se vea mientras escribes
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('numeroContrato');
    const display = document.getElementById('precioDisplay');
    
    if(input && display) {
        input.addEventListener('input', () => {
            const n = input.value;
            if (n >= 1 && n <= 500) {
                const p = 100 * Math.pow(0.954, n - 1);
                display.innerText = `Price: ${p.toFixed(8)} BTC`;
            } else {
                display.innerText = "Price: -- BTC";
            }
        });
    }
});