const { Relay, nip19, finalizeEvent } = require('nostr-tools');

// --- CONSTANTES DEL PROYECTO ---
const RULES_ID = '0839e5527a4d53a992e59e5513d463289069695d82623910c283391786356784';
const ORACLE_ID = 'a78319d2438e2840e82f5c8cec3d502f3750fd5b135e91410918f7d209c9a144';
const RELAYS = ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.nostr.band'];

let deudaPerCapita = 0;

async function inicializarApp() {
    const displayDeuda = document.getElementById('deuda-valor');
    const btnCalcular = document.getElementById('btn-conectar');
    const btnComprar = document.getElementById('btn-comprar');

    // 1. CONEXIÓN AL ORÁCULO DE DEUDA
    for (const url of RELAYS) {
        try {
            const relay = await Relay.connect(url);
            const sub = relay.subscribe([{ ids: [ORACLE_ID] }], {
                onevent(evento) {
                    const dpTag = evento.tags.find(t => t[0] === 'dp');
                    if (dpTag) {
                        deudaPerCapita = parseFloat(dpTag[1]);
                        displayDeuda.innerText = deudaPerCapita.toLocaleString() + " €";
                    }
                    sub.close();
                    relay.close();
                }
            });
        } catch (err) {
            console.log("Error de conexión al relay: " + url);
        }
    }

    // 2. LA LEY DEL PRECIO (Lógica de Incentivos)
    function calcularPrecio(n) {
        // RANGO 1-100: ERA DE FUNDADORES (Decaimiento de 10 BTC a 1 SAT)
        if (n >= 1 && n <= 100) {
            const pInicial = 1000000000; 
            const k = Math.log(pInicial) / 99; 
            return Math.max(1, Math.round(pInicial * Math.exp(-k * (n - 1))));
        } 
        
        // PUNTO DE ANCLAJE: El contrato #101 siempre vale 1 satoshi
        if (n === 101) {
            return 1;
        }

        // ERA SOBERANA (n > 101): Sensibilidad a la deuda
        const B = 1;           
        const ALPHA = 0.000001; 
        const precio = (B / Math.sqrt(n)) * Math.exp(ALPHA * deudaPerCapita);
        
        return Math.max(1, Math.round(precio));
    }

    // 3. ACCIÓN: CONSULTAR PRECIO
    btnCalcular.onclick = function() {
        const nInput = prompt("Introduce el número de contrato a consultar:", "101");
        const n = parseInt(nInput) || 101;
        const precio = calcularPrecio(n);
        alert("Soberanía Nostr\nConsulta #" + n + "\nPrecio: " + precio.toLocaleString() + " satoshis");
    };

    // 4. ACCIÓN: FIRMAR Y EMITIR CONTRATO
    btnComprar.onclick = async function() {
        const userName = document.getElementById('user-name').value;
        const userNsec = document.getElementById('user-nsec').value;
        const nInput = prompt("¿Qué número de contrato vas a firmar?", "101");
        const n = parseInt(nInput);

        if (!userNsec || !userName || isNaN(n)) {
            return alert("Por favor, introduce tu pseudónimo, nsec y el número de contrato.");
        }

        try {
            const { data: privKey } = nip19.decode(userNsec.trim());
            const precioSats = calcularPrecio(n);

            const contratoEvent = {
                kind: 31000,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["d", "CONTRATO_SOBERANIA_" + n],
                    ["e", RULES_ID],
                    ["price", precioSats.toString()],
                    ["user", userName]
                ],
                content: "Yo, " + userName + ", acepto los términos de soberanía individual del contrato #" + n + " por un valor de " + precioSats + " sats."
            };

            const firmado = finalizeEvent(contratoEvent, privKey);

            for (const url of RELAYS) {
                try {
                    const relay = await Relay.connect(url);
                    await relay.publish(firmado);
                    relay.close();
                } catch (e) {
                    console.error("Fallo al publicar en " + url);
                }
            }

            // --- GENERACIÓN DEL CERTIFICADO VISUAL ---
            const fecha = new Date(firmado.created_at * 1000).toLocaleString();
            const npub = nip19.npubEncode(firmado.pubkey);
            const eventUrl = "https://njump.me/" + firmado.id;

            document.getElementById('cert-numero').innerText = "#" + n;
            document.getElementById('cert-soberano').innerText = userName;
            document.getElementById('cert-npub').innerText = npub.substring(0, 20) + "...";
            document.getElementById('cert-timestamp').innerText = fecha;
            document.getElementById('cert-precio').innerText = precioSats.toLocaleString();
            document.getElementById('cert-id-evento').innerText = firmado.id;

            document.getElementById('certificado-container').style.display = 'block';
            
            // Generar QR de forma segura
            const qrDiv = document.getElementById('qrcode');
            if (qrDiv) {
                qrDiv.innerHTML = ''; 
                new QRCode(qrDiv, {
                    text: eventUrl,
                    width: 128,
                    height: 128,
                    colorDark : "#5828e5",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }

            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            alert("¡ÉXITO! Contrato #" + n + " emitido y grabado en Nostr.");

        } catch (error) {
            alert("Error: Asegúrate de que tu nsec sea válida.");
            console.error(error);
        }
    };
}

window.onload = inicializarApp;