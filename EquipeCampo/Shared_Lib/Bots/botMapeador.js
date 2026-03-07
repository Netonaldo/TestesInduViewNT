const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const logFile = path.join(__dirname, '..', 'botAlmox_mapeamento.log');

// Limpa o arquivo de log se existir
if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
}

(async () => {
    console.log("[Mapeador Almox] Iniciando ambiente para mapeamento do Almoxarifado...");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Configura função espiã
    await page.exposeFunction('logClick', (msg) => {
        console.log(`\n[CLIQUE CAPTURADO] ${msg}`);
        fs.appendFileSync(logFile, `[CLIQUE] ${msg}\n`);
    });

    // Injeta o espião de cliques
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
                            if (sib.nodeName.toLowerCase() == selector)
                                nth++;
                        }
                        if (nth != 1) selector += ":nth-of-type(" + nth + ")";
                    }
                    path.unshift(selector);
                    el = el.parentNode;
                }
                return path.join(" > ");
            }

            const selector = getCssPath(e.target);
            const text = e.target.innerText ? e.target.innerText.substring(0, 30).trim().replace(/\n/g, ' ') : '';
            const placeholder = e.target.placeholder || '';
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

            let info = `Alvo: <${e.target.tagName.toLowerCase()}>`;
            if (placeholder) info += ` | Placeholder: "${placeholder}"`;
            if (text && !isInput) info += ` | Texto: "${text}"`;
            info += `\n   Seletor CSS: ${selector}`;

            window.logClick(info);
        }, true); // Use capture phase para garantir a interceptação
    });

    try {
        console.log("Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        console.log("Efetuando login silenciosamente...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN, { delay: 10 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD, { delay: 10 });
        await page.click('button[type="submit"]');

        console.log("\n========================================================");
        console.log("✅ MAPEDOR PRONTO! NAVEGADOR ABERTO.");
        console.log("⚠️ A partir de agora:");
        console.log("1. Navegue e selecione o projeto.");
        console.log("2. Abra a tela de cadastro de Materiais (Almoxarifado).");
        console.log("3. Clique em TODOS os campos que deverão ser preenchidos pelo bot.");
        console.log("   Tudo o que você clicar está sendo gravado em 'botAlmox_mapeamento.log'.");
        console.log("========================================================\n");

    } catch (err) {
        console.error("ERRO:", err);
    }
})();
