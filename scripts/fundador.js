// fundador.js - ejecutar LOCALMENTE en PC1. NUNCA subir a GitHub con la nsec.
// Uso: set ORACULO_NSEC=tu_nsec_aqui && node fundador.js 1

const { finalizeEvent, nip19 } = require('nostr-tools');
const { Relay } = require('nostr-tools/relay');

async function emitirContrato(numero) {
  const nsecRaw = process.env.ORACULO_NSEC;
  if (!nsecRaw) {
    console.error('ERROR: define ORACULO_NSEC');
    process.exit(1);
  }

  // v2.x requiere decodificar la nsec a Uint8Array
  const { type, data: secretKey } = nip19.decode(nsecRaw);
  if (type !== 'nsec') {
    console.error('ERROR: la clave no es una nsec valida');
    process.exit(1);
  }

  const relay = await Relay.connect('wss://relay.damus.io');
  console.log('Conectado a relay Nostr...');

  const event = finalizeEvent({
    kind: 30068,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', 'contrato-' + numero],
      ['numero', String(numero)],
      ['deuda_per_capita_eur', '35597'],
      ['fuente_deuda', 'Banco de Espana BIEST - API oficial Marzo 2026'],
      ['protocolo', 'SatoshiNostr V1.0'],
      ['alpha_parameter', '0.046144'],
      ['formula', '10e9 * exp(-0.046144 * (n-1))']
    ],
    content: 'Contrato #' + numero + ' - Protocolo SatoshiNostr - Declaracion de Soberania'
  }, secretKey);

  await relay.publish(event);
  console.log('Contrato #' + numero + ' publicado.');
  console.log('ID del evento:', event.id);
  console.log('Verificar en: https://njump.me/' + event.id);
  relay.close();
}

const numero = parseInt(process.argv[2]);
if (!numero || numero < 1) {
  console.error('Uso: node fundador.js [numero]');
  process.exit(1);
}

emitirContrato(numero);
