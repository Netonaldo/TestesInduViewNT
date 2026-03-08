const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const paths = require('../../../Shared_Lib/Utils/paths');

// Carregar variáveis de ambiente
require('dotenv').config({ path: paths.ENV_PATH });

(async () => {
    console.log("[Planning] Iniciando Bot de Exploração de Planejamento (botExplorePlanning.js)");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    const waitTimeout = 25000;

    try {
        console.log("[Passo 1] Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        console.log("[Passo 2] Efetuando login...");
        await page.waitForSelector('input[type="email"]', { timeout: waitTimeout });
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN || 'virginio.neto@doublex.com.br', { delay: 50 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD || 'A11223300a@', { delay: 50 });
        await page.click('button[type="submit"]');

        console.log("[Passo 3] Aguardando Dashboard...");
        await new Promise(r => setTimeout(r, 10000));

        // Tenta acessar Planejamento
        console.log("[Passo 4] Acessando seção de Planejamento...");
        try {
            const [planningLink] = await page.$$("::-p-xpath(//a[contains(text(), 'Planejamento')] | //span[text()='Planejamento'])");
            if (planningLink) {
                await planningLink.click();
                await new Promise(r => setTimeout(r, 5000));
                console.log("  > Seção de Planejamento acessada via menu.");
            } else {
                throw new Error("Link não encontrado");
            }
        } catch (e) {
            console.log("  > Falha ao clicar no link de Planejamento, tentando via URL direta...");
            await page.goto("https://industryview.doublex.ai/planning", { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
        }

        // Mapeamento de colunas/campos
        console.log("[Passo 5] Mapeando campos da página...");
        const headers = await page.evaluate(() => {
            const ths = Array.from(document.querySelectorAll('th')).map(el => el.innerText.trim());
            const spans = Array.from(document.querySelectorAll('.flex-row span, .grid span')).map(el => el.innerText.trim());
            const divs = Array.from(document.querySelectorAll('[role="columnheader"]')).map(el => el.innerText.trim());
            return [...new Set([...ths, ...spans, ...divs])].filter(t => t.length > 2);
        });
        console.log("  > Headers encontrados:", headers);
        
        const results = {
            secao: "Planejamento",
            campos_identificados: headers,
            url_atual: page.url(),
            timestamp: new Date().toISOString()
        };

        const outputDir = path.join(paths.ROOT, 'Gestao_IA');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, 'mapping_planning_js.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));
        
        const screenshotPath = path.join(outputDir, 'planning_view_js.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`[SUCESSO] Mapeamento concluído. JSON: ${outputPath}`);

    } catch (err) {
        console.error("[ERRO CRÍTICO]", err);
    } finally {
        await browser.close();
        console.log("[FIM] Navegador encerrado.");
    }
})();
