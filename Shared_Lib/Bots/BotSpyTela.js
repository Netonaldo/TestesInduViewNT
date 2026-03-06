const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// .env na raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const outputDir = path.join(__dirname, '..', 'Output');
const logFile = path.join(outputDir, 'BotSpyTela.log');

// Garante que a pasta Output existe
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Limpa o log anterior
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

(async () => {
    console.log("[BotSpyTela] Iniciando espião de tela...");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Configura função espiã (bridge browser → Node)
    await page.exposeFunction('logClick', (msg) => {
        console.log(`\n[CLIQUE CAPTURADO] ${msg}`);
        fs.appendFileSync(logFile, `[CLIQUE] ${msg}\n`);
    });

    // Injeta o espião de cliques em toda navegação
    await page.evaluateOnNewDocument(() => {
        document.addEventListener('click', (e) => {
            function getCssPath(el) {
                if (!(el instanceof Element)) return '';
                var path = [];
                while (el.nodeType === Node.ELEMENT_NODE) {
                    var selector = el.nodeName.toLowerCase();
                    if (el.id) {
                        selector += '#' + el.id;
                        path.unshift(selector);
                        break;
                    } else {
                        var sib = el, nth = 1;
                        while (sib = sib.previousElementSibling) {
                            if (sib.nodeName.toLowerCase() == selector) nth++;
                        }
                        if (nth != 1) selector += ":nth-of-type(" + nth + ")";
                    }
                    path.unshift(selector);
                    el = el.parentNode;
                }
                return path.join(" > ");
            }

            const selector = getCssPath(e.target);
            const text = e.target.innerText
                ? e.target.innerText.substring(0, 30).trim().replace(/\n/g, ' ')
                : '';
            const placeholder = e.target.placeholder || '';
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

            let info = `Alvo: <${e.target.tagName.toLowerCase()}>`;
            if (placeholder) info += ` | Placeholder: "${placeholder}"`;
            if (text && !isInput) info += ` | Texto: "${text}"`;
            info += `\n   Seletor CSS: ${selector}`;

            window.logClick(info);
        }, true); // capture phase — intercepta antes do React/Vue
    });

    try {
        console.log("Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        console.log("Efetuando login...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN, { delay: 10 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD, { delay: 10 });
        await page.click('button[type="submit"]');

        console.log("\n========================================================");
        console.log("✅ BOTSPYTELA PRONTO! NAVEGADOR ABERTO.");
        console.log("⚠️  A partir de agora:");
        console.log("  1. Selecione o projeto no IndustryView.");
        console.log("  2. Abra a TELA que deseja mapear.");
        console.log("  3. Clique em TODOS os campos e botões relevantes.");
        console.log(`  Log gravado em: ${logFile}`);
        console.log("========================================================\n");

    } catch (err) {
        console.error("[ERRO]", err);
    }
    // Navegador fica aberto para uso manual
})();
