// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const btnEmitir = document.getElementById('btnEmitir');

    if (!btnEmitir) {
        console.error("No se encontró el botón con ID 'btnEmitir'");
        return;
    }

    btnEmitir.addEventListener('click', async () => {
        // 1. Validar que los campos no estén vacíos antes de cobrar
        const nombre = document.getElementById('nombre').value;
        const deuda = document.getElementById('deuda').value;

        if (!nombre || !deuda) {
            alert("Por favor, rellena tu nombre y el concepto de la deuda antes de emitir.");
            return;
        }

        // 2. Verificar si la extensión Alby está instalada (WebLN)
        if (!window.webln) {
            alert("Por favor, instala o desbloquea la extensión Alby para emitir el certificado.");
            return;
        }

        try {
            // 3. Despertar la extensión Alby
            await window.webln.enable();

            // 4. Crear la factura de 1 satoshi
            // Alby detecta automáticamente que el cobro es para SatoshiNostr
            const invoice = await window.webln.makeInvoice({
                amount: 1,
                defaultMemo: "Protocolo NostrDebt: Pago de Soberanía"
            });

            // 5. Solicitar el pago al usuario
            const response = await window.webln.sendPayment(invoice.paymentRequest);

            // 6. Si el pago es exitoso (existe el preimage), generamos el PDF
            if (response.preimage) {
                console.log("Pago confirmado