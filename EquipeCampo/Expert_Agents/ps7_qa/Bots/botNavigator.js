const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const paths = require('../../../Shared_Lib/Utils/paths');

// Carregar variáveis de ambiente usando o utilitário central
require('dotenv').config({ path: paths.ENV_PATH });

(async () => {
    console.log("[QA] Iniciando Navegador Inteligente (botNavigator.js)");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        console.log("[Passo 1] Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        console.log("[Passo 2] Efetuando login...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN, { delay: 50 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD, { delay: 50 });
        await page.click('button[type="submit"]');

        console.log("[Passo 3] Aguardando Dashboard...");
        await new Promise(r => setTimeout(r, 5000));

        // Captura da Dashboard
        const dashPath = path.join(paths.SCREENSHOTS_BROWSER, 'dashboard_main.png');
        await page.screenshot({ path: dashPath });
        console.log(`[QA] Screenshot salvo: ${dashPath}`);

        // Mapeamento de Seções
        const secoes = ["Planejamento", "Estoque", "SSMA", "Equipamentos"];
        for (const secao of secoes) {
            console.log(`[QA] Navegando para seção: ${secao}...`);
            const [link] = await page.$$(`::-p-xpath(//span[contains(text(), '${secao}')] | //a[contains(text(), '${secao}')])`);
            if (link) {
                await link.click();
                await new Promise(r => setTimeout(r, 3000));
                
                const screenshotPath = path.join(paths.SCREENSHOTS_BROWSER, `view_${secao.toLowerCase()}.png`);
                await page.screenshot({ path: screenshotPath });
                console.log(`  > [OK] Mapeado: ${screenshotPath}`);
            } else {
                console.log(`  > [AVISO] Seção ${secao} não encontrada no menu.`);
            }
        }

    } catch (err) {
        console.error("[ERRO CRÍTICO]", err);
    } finally {
        console.log("[QA] Navegador permanecerá aberto para inspeção final.");
        // await browser.close();
    }
})();
