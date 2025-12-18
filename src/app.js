// CONFIGURACIÓN DEL ORÁCULO
const lightningAddress = "soaringprofessional681756@getalby.com";

// Base de datos simulada (En V 2.0 esto vendrá de LNbits)
const numerosOcupados = {
    "21": { dueño: "Hal Finney", precio: 1000000 },
    "7": { dueño: "Suertudo_99", precio: 500 }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnVerificar = document.getElementById('btnVerificar');
    const btnEmitir = document.getElementById('btnEmitir');
    const seccionCompra = document.getElementById('seccionCompra');
    const statusMsg = document.getElementById('statusMsg');

    // 1. LÓGICA DE VERIFICACIÓN (MARKET ENGAGEMENT)
    btnVerificar.addEventListener('click', () => {
        const num = document.getElementById('montoNumero').value;
        
        if (!num) {
            alert("Por favor, introduce el número que deseas reclamar.");
            return;
        }

        if (numerosOcupados[num]) {
            // OPCIÓN A: YA COMPRADO
            statusMsg.innerHTML = `<span style="color: #ff4141;">⚠️ EL NÚMERO #${num} YA TIENE DUEÑO.</span><br>
                                   Propiedad de: ${numerosOcupados[num].dueño}.<br>
                                   Puedes hacer una oferta de redención por ${numerosOcupados[num].precio} sats.`;
            seccionCompra.style.display = 'none';
        } else {
            // OPCIÓN B: DISPONIBLE
            statusMsg.innerHTML = `<span style="color: #00ff41;">✅ ¡NÚMERO #${num} DISPONIBLE!</span><br>
                                   Precio base: 1 satoshi.`;
            seccionCompra.style.display = 'block';
        }
    });

    // 2. LÓGICA DE EMISIÓN (CONTRATO)
    btnEmitir.addEventListener('click', () => {
        const nombre = document.getElementById('nombre').value;
        const num = document.getElementById('montoNumero').value;
        const proclama = document.getElementById('proclama').value;

        if (!nombre) {
            alert("Necesitas una Identidad Soberana para firmar el contrato.");
            return;
        }

        const mensajePago = `SISTEMA DE VALIDACIÓN SATOSHINOSTR:\n\n` +
                            `RECLAMACIÓN: Número #${num}\n` +
                            `TITULAR: ${nombre}\n\n` +
                            `Para sellar este activo, envía 1 sat a:\n${lightningAddress}\n\n` +
                            `¿Confirmas que el pago ha sido enviado?`;

        if (confirm(mensajePago)) {
            generarCertificadoPDF(nombre, num, proclama);
        }
    });
});

// 3. GENERACIÓN DEL TÍTULO DE PROPIEDAD
function generarCertificadoPDF(nombre, numero, proclama) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Fondo y Bordes
    doc.setDrawColor(0, 255, 65);
    doc.rect(10, 10, 190, 277);

    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.text("TÍTULO DE PROPIEDAD SOBERANA", 30, 40);
    
    doc.setFontSize(16);
    doc.text(`ACTIVO NUMÉRICO REGISTRADO: # ${numero}`, 30, 60);
    
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    doc.text("------------------------------------------------", 30, 70);
    doc.text(`TITULAR DEL DERECHO: ${nombre.toUpperCase()}`, 30, 85);
    
    if (proclama) {
        doc.text("DECLARACIÓN DE SOBERANÍA:", 30, 105);
        doc.setFont("courier", "italic");
        const splitProclama = doc.splitTextToSize(`"${proclama}"`, 150);
        doc.text(splitProclama, 35, 115);
    }

    let finalY = proclama ? 160 : 120;
    doc.setFont("courier", "normal");
    doc.text("------------------------------------------------", 30, finalY);
    doc.text(`FECHA DE REGISTRO: ${new Date().toLocaleDateString()}`, 30, finalY + 10);
    doc.text("VALIDACIÓN: PAGO 1 SAT CONFIRMADO", 30, finalY + 20);
    
    doc.setFontSize(10);
    doc.text("Este documento certifica que el titular ha redimido la", 30, finalY + 40);
    doc.text("deuda estatal asociada a este número en el protocolo.", 30, finalY + 45);

    doc.setFontSize(14);
    doc.setFont("courier", "bold");
    doc.text("FIRMADO: SATOSHINOSTR ORACLE", 30, finalY + 70);

    doc.save(`Propiedad_Soberana_${numero}.pdf`);
}