const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const paths = require('../../../Shared_Lib/Utils/paths');

// Carregar variáveis de ambiente
require('dotenv').config({ path: paths.ENV_PATH });

(async () => {
    console.log("[Almox] Iniciando Bot de Verificação de Inventário (botFetchInventory.js)");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    const waitTimeout = 30000;

    try {
        console.log("[Passo 1] Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        console.log("[Passo 2] Efetuando login...");
        await page.waitForSelector('input[type="email"]', { timeout: waitTimeout });
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN || 'virginio.neto@doublex.com.br', { delay: 50 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD || 'A11223300a@', { delay: 50 });
        await page.click('button[type="submit"]');

        console.log("[Passo 3] Aguardando Dashboard (15s)...");
        await new Promise(r => setTimeout(r, 15000));

        // SELEÇÃO DE PROJETO
        console.log("[Passo 4] Selecionando Projeto...");
        const [dropdown] = await page.$$("::-p-xpath(//button[contains(., 'projeto')] | //div[contains(text(), 'projeto')])");
        if (dropdown) {
            await dropdown.click();
            await new Promise(r => setTimeout(r, 2000));
            const [option] = await page.$$("::-p-xpath(//*[contains(text(), 'ATK_102_25') or contains(text(), 'Milho')])");
            if (option) {
                await option.click();
                console.log("  > Projeto selecionado.");
                await new Promise(r => setTimeout(r, 10000));
            }
        }

        // Acessar menu Estoque
        console.log("[Passo 5] Acessando Estoque...");
        const [estoqueLink] = await page.$$("::-p-xpath(//a[contains(., 'Estoque')] | //span[text()='Estoque'])");
        if (estoqueLink) {
            await estoqueLink.click();
            await new Promise(r => setTimeout(r, 15000));
        }

        // Captura a tabela de itens
        console.log("[Passo 6] Capturando dados do inventário...");
        const tableData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            if (rows.length === 0) return [];
            
            const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.innerText.trim());
            return rows.slice(1).map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const item = {};
                cells.forEach((cell, i) => {
                    const header = headers[i] || `col_${i}`;
                    item[header] = cell.innerText.trim();
                });
                return item;
            });
        });

        console.log(`  > ${tableData.length} itens encontrados no sistema.`);

        const results = {
            total_count: tableData.length,
            items: tableData,
            timestamp: new Date().toISOString()
        };

        console.log("[DEBUG] paths:", JSON.stringify(paths, null, 2));
        const outputDir = path.join(paths.ROOT, 'Gestao_IA');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, 'current_inventory_js.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));
        
        const screenshotPath = path.join(outputDir, 'current_inventory_js.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`[SUCESSO] Inventário capturado. JSON: ${outputPath}`);

    } catch (err) {
        console.error("[ERRO CRÍTICO]", err);
    } finally {
        await browser.close();
        console.log("[FIM] Navegador encerrado.");
    }
})();
