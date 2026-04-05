/**
 * SatoshiNostr — update-inventory.js
 *
 * Llamado desde fundador.js tras confirmar pago de un nodo.
 * Actualiza el Gist público con el nuevo nodo vendido.
 *
 * USO:
 *   set GITHUB_TOKEN=ghp_TU_TOKEN_AQUI
 *   node scripts/update-inventory.js <nodeNumber>
 *
 * SETUP (una sola vez):
 *   1. Crea un Gist público en https://gist.github.com
 *      Filename: satoshinostr-inventory.json
 *      Content:  {"sold":[]}
 *   2. Copia el Gist ID de la URL (el hex largo)
 *   3. Pégalo en GIST_ID abajo Y en index.html
 *   4. Crea un GitHub token en https://github.com/settings/tokens
 *      Scope mínimo: "gist" (solo gist, nada más)
 *   5. Guarda el token en C:\claves-privadas\github-gist-token.txt
 *      NUNCA en el repo.
 */

const https = require('https');

// ── CONFIGURACIÓN ──────────────────────────────────────────────
const GIST_ID = '6f8d077663126701055862201e36f95d'; // igual que en index.html
const GIST_FILENAME = 'satoshinostr-inventory.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// ───────────────────────────────────────────────────────────────

const nodeArg = parseInt(process.argv[2]);

if (!nodeArg || nodeArg < 1 || nodeArg > 500) {
    console.error('[update-inventory] ERROR: Indica un nodo válido (1-500)');
    console.error('  Uso: node scripts/update-inventory.js <nodeNumber>');
    process.exit(1);
}

if (!GITHUB_TOKEN) {
    console.error('[update-inventory] ERROR: Variable GITHUB_TOKEN no definida.');
    console.error('  set GITHUB_TOKEN=ghp_xxxxxxxxxxxxx');
    process.exit(1);
}

if (GIST_ID === 'YOUR_GIST_ID_HERE') {
    console.error('[update-inventory] ERROR: Configura GIST_ID en este archivo.');
    process.exit(1);
}

function githubRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'SatoshiNostr-Inventory/1.0',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    reject(new Error(`GitHub API ${res.statusCode}: ${data}`));
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function main() {
    console.log(`[update-inventory] Reclamando nodo #${nodeArg}...`);

    // 1. Leer Gist actual
    const gist = await githubRequest('GET', `/gists/${GIST_ID}`);
    const currentContent = gist.files[GIST_FILENAME]?.content;
    if (!currentContent) {
        throw new Error(`Archivo ${GIST_FILENAME} no encontrado en el Gist.`);
    }

    let inventory;
    try {
        inventory = JSON.parse(currentContent);
    } catch {
        throw new Error('El Gist no contiene JSON válido.');
    }

    if (!Array.isArray(inventory.sold)) inventory.sold = [];

    // 2. Verificar que no esté ya vendido
    if (inventory.sold.includes(nodeArg)) {
        console.warn(`[update-inventory] AVISO: Nodo #${nodeArg} ya estaba en el inventario. No se modifica.`);
        process.exit(0);
    }

    // 3. Añadir nodo y ordenar
    inventory.sold.push(nodeArg);
    inventory.sold.sort((a, b) => a - b);
    inventory.last_updated = new Date().toISOString();
    inventory.total_sold = inventory.sold.length;

    // 4. Actualizar Gist
    await githubRequest('PATCH', `/gists/${GIST_ID}`, {
        files: {
            [GIST_FILENAME]: {
                content: JSON.stringify(inventory, null, 2)
            }
        }
    });

    console.log(`[update-inventory] ✓ Nodo #${nodeArg} registrado.`);
    console.log(`[update-inventory] Total vendidos: ${inventory.sold.length} / 500`);
    console.log(`[update-inventory] Disponibles: ${500 - inventory.sold.length} / 500`);

    // 5. Copiar inventory al repo de la landing y hacer push automático
    const fs = require('fs');
    const { execSync } = require('child_process');
    const LANDING_REPO = 'C:\\nostr-soberania\\SatoshiNostr.github.io';
    const LANDING_INVENTORY = `${LANDING_REPO}\\inventory.json`;

    try {
        fs.writeFileSync(LANDING_INVENTORY, JSON.stringify(inventory, null, 2), 'utf8');
        execSync(`git -C "${LANDING_REPO}" add inventory.json`, { stdio: 'pipe' });
        execSync(`git -C "${LANDING_REPO}" commit -m "inventory: nodo #${nodeArg} vendido — ${inventory.total_sold}/500"`, { stdio: 'pipe' });
        execSync(`git -C "${LANDING_REPO}" push origin main`, { stdio: 'pipe' });
        console.log(`[update-inventory] ✓ Landing actualizada: inventory.json pusheado.`);
    } catch (e) {
        console.warn(`[update-inventory] AVISO: No se pudo actualizar la landing: ${e.message}`);
        console.warn(`[update-inventory] Actualiza manualmente: copia inventory.json a ${LANDING_REPO}`);
    }
}

main().catch(e => {
    console.error('[update-inventory] FATAL:', e.message);
    process.exit(1);
});
