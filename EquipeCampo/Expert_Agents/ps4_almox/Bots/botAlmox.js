const puppeteer = require('puppeteer');
const xlsx = require('xlsx');
const path = require('path');
const paths = require('../../../Shared_Lib/Utils/paths');

// Carregar variáveis de ambiente usando o utilitário central
require('dotenv').config({ path: paths.ENV_PATH });

(async () => {
    console.log("[Almox] Iniciando Bot de Cadastro de Materiais (botAlmox.js)");

    // Lendo dados da planilha Excel
    const filePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(paths.DADOS_PROJETO, 'Dados de Entrada', 'Documentos Internos', 'MatriaisATK.xlsx');
    const sheetArgument = process.argv[3] || 'Encaminhamento';
    
    let materiais = [];
    try {
        const workbook = xlsx.readFile(filePath);
        // Tenta achar a aba pelo argumento ou usa a primeira
        const sheetNameFound = workbook.SheetNames.includes(sheetArgument) ? sheetArgument : workbook.SheetNames[0];
        
        console.log(`[INFO] Lendo arquivo '${filePath}', aba '${sheetNameFound}'`);
        
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameFound], { defval: "" });

        // Validação de colunas flexível
        materiais = data.filter(r => r["Código"] || r["CÓDIGO"] || r["Codigo"] || r["Descricao NF"]);
        console.log(`[INFO] Encontrados ${materiais.length} materiais na aba.`);
    } catch (e) {
        console.error("[ERRO] Falha ao ler MatriaisATK.xlsx:", e.message);
        return;
    }

    if (materiais.length === 0) {
        console.log("[AVISO] Nenhum material válido para cadastrar. Encerrando.");
        return;
    }

    // Sem limite de itens por padrão, mas aceita 3º argumento como limite
    const limitArgument = process.argv[3] ? parseInt(process.argv[3]) : null;
    const itensParaCadastrar = limitArgument ? materiais.slice(0, limitArgument) : materiais;
    
    if (limitArgument) {
        console.log(`[INFO] Limitando o cadastro aos primeiros ${itensParaCadastrar.length} materiais da aba.`);
    } else {
        console.log(`[INFO] Cadastrando todos os ${itensParaCadastrar.length} materiais.`);
    }

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

        console.log("[Passo 3] Aguardando Dashboard (15s)...");
        await new Promise(r => setTimeout(r, 1500));

        // SELEÇÃO DE PROJETO
        console.log("[Passo 4] Selecionando Projeto...");
        const dropdownXpath = "//button[contains(., 'projeto')] | //div[contains(text(), 'projeto')] | //div[contains(@class, 'select') and contains(., 'projeto')]";
        const [dropdown] = await page.$$('::-p-xpath(' + dropdownXpath + ')');
        if (dropdown) {
            await dropdown.click();
            await new Promise(r => setTimeout(r, 1500));
            // De acordo com o mapeamento, o nome exibido é "Montagem Processo Milho - EBER"
            const [option] = await page.$$("::-p-xpath(//*[contains(text(), 'Montagem Processo Milho - EBER') or contains(text(), 'ATK_102_25')])");
            if (option) {
                await option.click();
                console.log("  > Projeto Montagem Processo Milho - EBER selecionado.");
            } else {
                console.log("  > [ALERTA] Opção do projeto não encontrada no dropdown principal.");
            }
        }

        await new Promise(r => setTimeout(r, 1500));

        // Acessar menu Estoque
        console.log("[Passo 5] Acessando Estoque...");
        const [estoqueLink] = await page.$$("::-p-xpath(//span[text()='Estoque' or contains(., 'Estoque')])");
        if (estoqueLink) {
            await estoqueLink.click();
            await new Promise(r => setTimeout(r, 1500)); // Mais tempo para a tela de estoque renderizar
        }

        // [NOVO] SELEÇÃO DO PROJETO DENTRO DA TELA ESTOQUE
        console.log("[Passo 5.1] Selecionando o projeto na tela de Estoque...");
        try {
            // Clica no botão "Todos os projetos" ou dropdown similar que aparece
            const xpathDropdownEstoque = "//main//button[contains(., 'projetos') or contains(., 'Todos os projetos') or contains(@class, 'select')]";
            const [dropdownEstoque] = await page.$$('::-p-xpath(' + xpathDropdownEstoque + ')');

            if (dropdownEstoque) {
                await dropdownEstoque.click();
                await new Promise(r => setTimeout(r, 1500));

                // Clica no projeto ATK_102_25 (na lista que se abre)
                const [optionEstoque] = await page.$$("::-p-xpath(//*[contains(text(), 'ATK_102_25') or contains(text(), 'Montagem Processo Milho - EBER')])");
                if (optionEstoque) {
                    await optionEstoque.click();
                    await new Promise(r => setTimeout(r, 1500)); // Aguarda carregar a lista de produtos deste projeto
                }
            } else {
                console.log("  > [INFO] Dropdown de projeto não encontrado no Estoque. Tentando prosseguir.");
            }
        } catch (e) {
            console.log("  > [ERRO] Falha ao tentar selecionar projeto no Estoque:", e.message);
        }

        // FUNÇÃO DE PREENCHIMENTO BASEADA EM PLACEHOLDER COM LIMPEZA E FALLBACK
        const preencher = async (placeholder, valor) => {
            if (!valor) return;
            const selector = `input[placeholder*="${placeholder}" i], textarea[placeholder*="${placeholder}" i]`;
            const maxRetries = 3;
            
            for (let i = 0; i < maxRetries; i++) {
                try {
                    let targetElement = null;
                    
                    // Estratégia 1: CSS Selector
                    try {
                        const el = await page.$(selector);
                        if (el) targetElement = el;
                    } catch (e) {}

                    // Estratégia 2: XPath Label Fallback
                    if (!targetElement) {
                        const xpathLabel = `//label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${placeholder.toLowerCase()}')]/following::input[1] | //label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${placeholder.toLowerCase()}')]/following::textarea[1]`;
                        const [el] = await page.$$('::-p-xpath(' + xpathLabel + ')');
                        if (el) targetElement = el;
                    }

                    if (targetElement) {
                        try {
                            await targetElement.evaluate(el => el.scrollIntoView());
                        } catch (e) {} // Ignora se o nodo já desanexou aqui pra pegar no try principal
                        
                        await targetElement.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');
                        await targetElement.type(String(valor), { delay: 10 });
                        console.log(`  > [OK] Campo '${placeholder}' preenchido.`);
                        return; // Sucesso, sai do loop
                    } else {
                        console.log(`  > [FALHA] Campo '${placeholder}' não encontrado na tela.`);
                        return; // Não achou, não adianta tentar de novo
                    }
                } catch (e) {
                    if (e.message.includes('detached')) {
                        console.log(`  > [AVISO] Elemento '${placeholder}' desanexado do DOM (React re-render). Tentativa ${i+1}/${maxRetries}...`);
                        await new Promise(r => setTimeout(r, 500)); // Aguarda o re-render
                    } else {
                        console.log(`  > [FALHA] Erro interativo no campo '${placeholder}': ${e.message}`);
                        return;
                    }
                }
            }
            console.log(`  > [ERRO] Falha persistente ao tentar preencher '${placeholder}' após ${maxRetries} tentativas.`);
        };

        // FUNÇÃO DE FORMATAÇÃO DE MOEDA (0.000,00)
        const formatarMoedaBR = (valor) => {
            if (!valor && valor !== 0) return "";
            const num = parseFloat(String(valor).replace(',', '.'));
            if (isNaN(num)) return valor;
            return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // FUNÇÃO DE DROPDOWN GENÉRICA
        const selecionarDropdown = async (labelName, valorBusca) => {
            if (!valorBusca) return;
            try {
                console.log(`  > Preenchendo dropdown '${labelName}' com: ${valorBusca}...`);
                const xpathDropdown = `//label[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')=translate('${labelName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${labelName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]/../div//button | //label[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')=translate('${labelName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${labelName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]/..//svg | //label[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')=translate('${labelName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')]/following-sibling::div//button`;
                const [btn] = await page.$$('::-p-xpath(' + xpathDropdown + ')');
                if (btn) {
                    // Clica no abridor do dropdown
                    await btn.click();
                    console.log(`  > Aguardando 1 segundo do dropdown de ${labelName} carregar conforme solicitado...`);
                    await new Promise(r => setTimeout(r, 1000));

                    // Clica no resultado (exato ou que comece com o valorDaBusca, ex: 'PC' mapeia pra 'PC (Peça)')
                    const valorBuscaBaixo = valorBusca.toLowerCase();
                    const xpathOpcao = `//span[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='${valorBuscaBaixo}' or starts-with(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${valorBuscaBaixo} ')] | //div[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='${valorBuscaBaixo}' or starts-with(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${valorBuscaBaixo} ')]`;

                    const [spanOption] = await page.$$('::-p-xpath(' + xpathOpcao + ')');

                    if (spanOption) {
                        try {
                            await page.evaluate(el => el.scrollIntoView(), spanOption);
                            await spanOption.click();
                            console.log(`  > [OK] '${valorBusca}' já existia e foi selecionado em ${labelName}.`);
                        } catch (e) {
                            console.log(`  > [AVISO] Achou a opção mas não clicou: ${e.message}`);
                            await page.keyboard.press('Escape');
                        }
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        // [NOVA REGRA] Se for Fabricante, Categoria ou Unidade e não encontrou, tenta cadastrar novo. Senão, deixa em branco.
                        const labelBaixo = labelName.toLowerCase();
                        if (['fabricante', 'categoria', 'unidade'].includes(labelBaixo)) {
                            console.log(`  > Opção exata não localizada para ${labelName}. Tentando acionar '+Cadastrar...'`);

                            // Tenta achar o botão "Cadastrar (labelName)" no dropdown (ex: Cadastrar fabricante, Cadastrar categoria)
                            const xpathCadastrar = `//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cadastrar ${labelName.toLowerCase()}')] | //div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cadastrar ${labelName.toLowerCase()}')] | //span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cadastrar novo')]`;
                            const [btnCadastrar] = await page.$$('::-p-xpath(' + xpathCadastrar + ')');

                            if (btnCadastrar) {
                                await btnCadastrar.click();
                                console.log(`  > Clicou em Cadastrar ${labelName}. Aguardando modal...`);
                                await new Promise(r => setTimeout(r, 2000));

                                // Procura especificamente o input do modal baseado no placeholder com o nome da tag
                                // Ex: "Nome do fabricante", "Nome da unidade", "Nome da categoria"
                                const suffixName = labelName.toLowerCase();
                                const modalInputXpath = `//input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'nome do ${suffixName}') or contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'nome da ${suffixName}') or contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'nome do fabricante')]`;

                                const [modalInput] = await page.$$('::-p-xpath(' + modalInputXpath + ')');

                                if (modalInput) {
                                    console.log(`  > Modal detectado (input localizado)! Inserindo novo ${labelName}: ${valorBusca}`);
                                    await modalInput.click({ clickCount: 3 });
                                    await page.keyboard.press('Backspace');
                                    await modalInput.type(String(valorBusca), { delay: 30 });
                                    await new Promise(r => setTimeout(r, 1000));

                                    // Clica no último botão Salvar da tela (normalmente é o do modal que se sobrepõe)
                                    const botoesSalvar = await page.$$("::-p-xpath(//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'salvar') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cadastrar')])");
                                    if (botoesSalvar && botoesSalvar.length > 0) {
                                        const btnSalvarModal = botoesSalvar[botoesSalvar.length - 1]; // pega o último da DOM
                                        await btnSalvarModal.click();
                                        console.log(`  > Clicado em Salvar no modal com sucesso.`);
                                        await new Promise(r => setTimeout(r, 2000));
                                    } else {
                                        // Fallback
                                        await page.keyboard.press('Enter');
                                        await new Promise(r => setTimeout(r, 2000));
                                    }
                                } else {
                                    console.log(`  > ERRO: Input do Modal para cadastrar ${labelName} não foi encontrado/aberto.`);
                                    await page.keyboard.press('Escape'); // tenta abortar se travou
                                }
                            } else {
                                // Se não achar nem a opção nem o botão de cadastrar
                                console.log(`  > AVISO: Não pôde selecionar nem encontrou opção de Cadastrar para ${valorBusca} em ${labelName}`);
                                // Tenta dar Enter ou esvaziar caso o form segure
                                await page.keyboard.press('Escape');
                            }
                        } else {
                            // Categoria diferente de Fabricante, ou seja, deixa VAZIO.
                            console.log(`  > [AVISO] Valor '${valorBusca}' não encontrado para ${labelName}. Deixando em BRANCO conforme regra.`);
                            await page.keyboard.press('Escape'); // Fecha dropdown
                        }
                    }

                    // Tratamento de modal executado apenas quando Cadastrar novo é acionado.
                } else {
                    await page.keyboard.press('Enter');
                }
            } catch (e) {
                console.log(`  > Falha ao definir dropdown ${labelName}: ${e.message}`);
            }
        };

        // LOOP DE CADASTRO
        for (let i = 0; i < itensParaCadastrar.length; i++) {
            const item = itensParaCadastrar[i];
            const cod = item['Código'] || item['CÓDIGO'] || item['Codigo'] || "";
            const desc = item['Descrição'] || item['DESCRIÇÃO'] || item['Descricao NF'] || item['Descricao'] || "";
            const und = item['Unidade'] || item['UNIDADE'] || item['Und'] || item['UND'] || "";
            const categoria = item['Categoria/Técnico'] || item['Categoria'] || item['CATEGORIA'] || item['Cat'] || item['CAT'] || item['Tipo'] || "";
            const fabricante = item['Fabricante'] || item['FABRICANTE'] || "";
            const qtd = item['ESTOQUE'] || item['Estoque'] || item['Quantidade'] || item['Quant'] || "";
            const qtdMinima = item['Est. Minimo'] || item['Est. Mínimo'] || item['Quantidade Mínima'] || item['Est. Mínim'] || "";

            console.log(`\n--- [${i + 1}/${itensParaCadastrar.length}] Processando: ${cod} ---`);

            // MODO DELEÇÃO VS ADIÇÃO
            console.log(`  > Procurando material ${cod} no estoque para ver se já existe e DELETAR...`);
            let itemExistente = false;
            try {
                // Tenta pesquisar no search principal se houver para evitar achar coisas da interface solta
                const [pesquisarEstoque] = await page.$$("::-p-xpath(//input[@placeholder='Pesquisar' or @placeholder='Pesquisar...'])");
                if (pesquisarEstoque) {
                    await pesquisarEstoque.click({ clickCount: 3 });
                    await pesquisarEstoque.press('Backspace');
                    await pesquisarEstoque.type(cod, { delay: 50 });
                    await new Promise(r => setTimeout(r, 1500));
                }

                // Agora procura se na listagem tem o código, especificamente em uma td ou span não input
                const [itemCard] = await page.$$(`::-p-xpath(//td[contains(., '${cod}')] | //tr[contains(., '${cod}')] | //span[text()='${cod}'])`);
                if (itemCard) {
                    console.log(`  > Material ${cod} já existe! Deletando material...`);
                    itemExistente = true;
                    // Tenta encontrar o botão excluir direto na linha
                    const xpathLixeira = `//tr[contains(., '${cod}')]//button[contains(@class, 'trash') or contains(@class, 'delete') or @title='Excluir' or @title='Remover']`;
                    const [btnLixeira] = await page.$$('::-p-xpath(' + xpathLixeira + ')');

                    if (btnLixeira) {
                        await btnLixeira.click();
                        await new Promise(r => setTimeout(r, 2000));
                        // Confirmação
                        const [btnConfirma] = await page.$$("::-p-xpath(//button[contains(., 'Sim') or contains(., 'Confirmar') or contains(., 'Excluir')])");
                        if (btnConfirma) await btnConfirma.click();
                        await new Promise(r => setTimeout(r, 1500));
                    } else {
                        // Clica na linha para abrir modal e clica em excluir
                        await itemCard.click();
                        await new Promise(r => setTimeout(r, 1500));
                        const [btnExcluirMod] = await page.$$("::-p-xpath(//button[contains(., 'Excluir') or contains(., 'Deletar')])");
                        if (btnExcluirMod) {
                            await btnExcluirMod.click();
                            await new Promise(r => setTimeout(r, 2000));
                            const [btnConfirma] = await page.$$("::-p-xpath(//button[contains(., 'Sim') or contains(., 'Confirmar') or contains(., 'Excluir')])");
                            if (btnConfirma) await btnConfirma.click();
                            await new Promise(r => setTimeout(r, 1500));
                        } else {
                            // Se não achou excluir, só fecha
                            const [sairBtn] = await page.$$("::-p-xpath(//button[contains(., 'Sair') or contains(., 'Cancelar')])");
                            if (sairBtn) await sairBtn.click();
                            await new Promise(r => setTimeout(r, 2000));
                        }
                    }
                    // Força recadastro completo
                    itemExistente = false;
                }
            } catch (e) { }

            if (!itemExistente) {
                // Clica em +Adicionar Produto
                console.log("  > Material não encontrado na listagem. Clicando em Adicionar Produto...");
                let [addBtn] = await page.$$("::-p-xpath(//button[contains(., 'Adicionar') or contains(., '+Adicionar')])");
                if (addBtn) {
                    await addBtn.click();
                    await new Promise(r => setTimeout(r, 2000)); // Aguarda formulário abrir
                } else {
                    const [addBtnFallback] = await page.$$("::-p-xpath(//main//button[contains(., 'Adicionar')])");
                    if (addBtnFallback) {
                        await addBtnFallback.click();
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            }

            // Dados Básicos
            console.log("  > Preenchendo campos básicos...");

            await preencher('MAT-', cod);
            await preencher('Nome do produto', desc);
            await preencher('especificações', desc);

            // Novos campos: Quantidade e Categoria / Fabricante
            await selecionarDropdown('Categoria', categoria);
            await selecionarDropdown('Unidade', und);
            await selecionarDropdown('Fabricante', fabricante);

            await preencher('Quantidade', qtd);
            await preencher('Quantidade Mínima', qtdMinima);

            // Tratamento Aba Fiscais / NCM / CEST / Preço / Lote
            console.log("  > Preenchendo aba Dados Fiscais...");
            try {
                const [abaFiscais] = await page.$$("::-p-xpath(//button[contains(., 'Dados Fiscais')])");
                if (abaFiscais) {
                    await abaFiscais.click();
                    await new Promise(r => setTimeout(r, 1500));

                    const ncm = item['NCM'] || "";
                    if (ncm) await preencher('NCM', ncm);

                    const cest = item['CEST'] || "";
                    if (cest) await preencher('CEST', cest);

                    const preco = item['Preço Custo'] || item['Preço de Custo'] || item['Preço Cust'] || "";
                    if (preco !== "") {
                        const precoFormatado = formatarMoedaBR(preco);
                        await preencher('Custo', precoFormatado);
                    }

                    const origem = item['Ind. Origem'] || item['Ind. Origer'] || "";
                    if (origem) await selecionarDropdown('Origem', origem);

                    const custodia = item['Tipo Custódia'] || item['Tipo Custó'] || "";
                    if (custodia) await selecionarDropdown('Custódia', custodia);

                    const lote = item['Lote'] || item['Lote/Batelada'] || "";
                    if (lote) await preencher('Lote', lote);

                    const classifFiscal = item['Classif. Fiscal'] || item['Classificação Fiscal'] || item['Classif. Fis'] || "";
                    if (classifFiscal) {
                        // Tenta dropdown primeiro, as vezes é combobox
                        await selecionarDropdown('Classificação Fiscal', classifFiscal);
                        // Tenta input caso dropdown falhe
                        await preencher('Classificação Fiscal', classifFiscal);
                    }

                    const codBarras = item['Cód. Barras'] || item['Código de Barras'] || "";
                    if (codBarras) await preencher('Barras', codBarras);
                }
            } catch (e) {
                console.log("  > Falha ao preencher aba fiscal/preços:", e.message);
            }

            await new Promise(r => setTimeout(r, 2000));

            console.log("  > [REVISÃO] Aguardando 1.5s para você conferir os dados na tela antes de salvar...");
            await new Promise(r => setTimeout(r, 1500));

            // Salvar
            console.log("  > Salvando Produto...");
            const [saveBtn] = await page.$$("::-p-xpath(//button[text()='Salvar' or text()='Cadastrar'])");
            if (saveBtn) {
                await saveBtn.click();
                await new Promise(r => setTimeout(r, 1500)); // Aguarda o salvamento e possível requisição
            } else {
                console.log("  > Botão salvar não encontrado! Tentando outro caminho.");
            }

            // Comentado/Removido o clique automático em Sair/Cancelar no final 
            // a pedido do usuário, que prefere manter a tela e a sessão intactas para inspeção.

            await new Promise(r => setTimeout(r, 2000));
        }

        console.log("\n==================================================");
        console.log("[SUCESSO] Piloto finalizado com sucesso!");
        console.log("==================================================");

    } catch (err) {
        console.error("[ERRO CRÍTICO]", err);
    } finally {
        console.log("[AVISO] O navegador ficará aberto para sua conferência.");
    }
})();
