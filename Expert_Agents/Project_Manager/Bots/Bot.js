const puppeteer = require('puppeteer');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env na Shared_Lib
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', 'Shared_Lib', '.env') });

(async () => {
    console.log("[PM] Iniciando Bot.js - Modo Visível para Validação de UX");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Dados dos 3 itens conforme solicitado
    const itens = [
        {
            "codigo": "MAT-0001",
            "nome": "CURVA VERTICAL EXTERNA P/ LEITO",
            "specs": "CURVA VERTICAL EXTERNA P/ LEITO, MEDIO, VIROLA EXTERNA 19MM, GF, CHAPA #16/18, R320, 90 G, 300 X 100MM",
            "ncm": "73089010", "cest": "1004100", "preco": "207.97"
        },
        {
            "codigo": "MAT-0002",
            "nome": "ABRACADEIRA TIPO OMEGA GF 1.1/2",
            "specs": "ABRACADEIRA TIPO OMEGA GF 1.1/2 DP 632-5 DISPAN",
            "ncm": "73269090", "cest": "1005000", "preco": "4.70"
        },
        {
            "codigo": "MAT-0003",
            "nome": "CONDULETE TIPO C 2 BSP",
            "specs": "CONDULETE, ROSCAVEL, ALUMINIO, C/ TAMPA, JUNTA VEDACAO, 2 BSP, TIPO C",
            "ncm": "76090000", "cest": "1004100", "preco": "42.10"
        }
    ];

    try {
        console.log("[Passo 1] Acessando IndustryView...");
        await page.goto('https://industryview.doublex.ai/dashboard', { waitUntil: 'networkidle2' });

        // LOGIN
        console.log("[Passo 2] Efetuando login...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', process.env.INDUSTRYVIEW_LOGIN, { delay: 100 });
        await page.type('input[type="password"]', process.env.INDUSTRYVIEW_PASSWORD, { delay: 100 });
        await page.click('button[type="submit"]');

        console.log("[Passo 3] Aguardando Dashboard (15s)...");
        await new Promise(r => setTimeout(r, 15000));

        // SELEÇÃO DE PROJETO
        console.log("[Passo 4] Selecionando Projeto ATK_102_25...");
        // Clica no seletor de projeto (procura por botão ou div que contenha "projeto")
        const dropdownXpath = "//button[contains(., 'projeto')] | //div[contains(text(), 'projeto')] | //div[contains(@class, 'select')]";
        const [dropdown] = await page.$$('::-p-xpath(' + dropdownXpath + ')');
        if (dropdown) {
            await dropdown.click();
            await new Promise(r => setTimeout(r, 2000));
            const [option] = await page.$$("::-p-xpath(//*[contains(text(), 'ATK_102_25')])");
            if (option) await option.click();
        }

        await new Promise(r => setTimeout(r, 10000));

        // LOOP DE CADASTRO
        for (const item of itens) {
            console.log(`\n--- Cadastrando Item: ${item.codigo} ---`);

            // Clica no menu lateral "Estoque"
            console.log("[Bot.js] Clicando no menu 'Estoque'...");
            const [estoqueLink] = await page.$$("::-p-xpath(//a[contains(., 'Estoque')])");
            if (estoqueLink) {
                await estoqueLink.click();
                await new Promise(r => setTimeout(r, 8000));
            }

            // Clica em +Adicionar Produto
            console.log("[Bot.js] Clicando em +Adicionar Produto...");
            const [addBtn] = await page.$$("::-p-xpath(//*[contains(text(), '+Adicionar Produto')])");
            if (addBtn) {
                await addBtn.click();
                await new Promise(r => setTimeout(r, 5000));
            }

            // FUNÇÃO DE PREENCHIMENTO HUMANO (Clica antes de digitar)
            const preencher = async (placeholder, valor) => {
                const selector = `input[placeholder*="${placeholder}"], textarea[placeholder*="${placeholder}"]`;
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    await page.click(selector); // Garante o foco
                    await page.type(selector, valor, { delay: 50 });
                    console.log(`  > Campo [${placeholder}] preenchido.`);
                } catch (e) {
                    console.log(`  > Campo [${placeholder}] não encontrado.`);
                }
            };

            await preencher('Ex: MAT-0001', item.codigo);
            await preencher('Nome do produto', item.nome);
            await preencher('especificações', item.specs);
            await preencher('00000000', item.ncm);
            await preencher('0000000', item.cest);
            await preencher('0.00', item.preco);

            // Aguarda 5 segundos para validação humana
            console.log("[Bot.js] Aguardando 5 segundos para conferência visual...");
            await new Promise(r => setTimeout(r, 5000));

            // Clica em Salvar
            console.log("[Bot.js] Clicando em Salvar...");
            const [saveBtn] = await page.$$("::-p-xpath(//button[contains(., 'Salvar') or contains(., 'Cadastrar')])");
            if (saveBtn) {
                await saveBtn.click();
                console.log("[Bot.js] Item salvo com sucesso!");
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        console.log("\n[FIM] Cadastro dos 3 itens finalizado.");

    } catch (err) {
        console.error("[ERRO CRÍTICO]", err);
    } finally {
        console.log("[AVISO] O navegador ficará aberto para sua conferência.");
    }
})();
