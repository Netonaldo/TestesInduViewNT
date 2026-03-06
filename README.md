# README.md — BASE PRINCIPAL DO PROJETO ATK_102_25 (SADA EBER)

> [!IMPORTANT]
> **INSTRUÇÃO PARA TODOS OS AGENTES IA (Claude, Gemini, GPT ou qualquer outro):**
> Este arquivo é a **fonte de verdade única** deste repositório. Consulte-o **sempre** ao iniciar uma sessão, antes de executar qualquer ação, e ao surgir qualquer dúvida sobre contexto, regras ou arquitetura.
>
> **Em caso de divergência** entre este arquivo e qualquer outro documento do repositório, **acione o usuário** para resolver antes de prosseguir. Não tome decisões unilaterais em situações ambíguas.

---

## 1. INFORMAÇÕES DO PROJETO (BACKBONE)

- **Projeto:** ATK_102_25 - SADA EBER (Montagem Processo Milho)
- **Escopo:** Montagem de processo de milho — Elétrica MT/BT e Instrumentação
- **Cliente:** Grupo SADA — EberBio Bioenergia e Agricultura
- **Localização:** Montes Claros de Goiás - GO
- **Cronograma:** 210 dias totais (30 dias mobilização + 180 dias execução)
- **Plataforma alvo:** IndustryView — `https://industryview.doublex.ai/dashboard`

**Objetivo:** Realizar o cadastro completo e validado do projeto no IndustryView, utilizando automação (Puppeteer/Selenium) e personas IA especialistas para cada domínio. O arquivo **`DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/Mestre.xlsx`** é a fonte primária de verdade para o que será aplicado no escopo, podendo indicar outras planilhas ou documentos mais detalhados para itens específicos.

---
## 2. GOVERNANÇA MULTI-AGENTE (ORQUESTRAÇÃO)

Este repositório opera com uma **arquitetura de agentes especialistas orquestrada**. O fluxo é determinado pelo **psProjectManager**, que define quem atua e em qual momento:

1. **Orquestração** — O **psProjectManager** recebe a solicitação, identifica a necessidade e aciona a persona correspondente (`psXXXXX`).
2. **Identificação** — Cada IA identifica qual agente corresponde à tarefa baseando-se na instrução do orquestrador.
3. **Leitura** — O especialista lê o arquivo `psXXXXX.md` em `Expert_Agents/`.
4. **Execução** — A execução ocorre estritamente dentro do escopo daquela persona.
5. **Feedback** — O especialista reporta ao orquestrador ou ao usuário conforme definido no fluxo.

O **psProjectManager** é o orquestrador-geral (quem e quando). Para detalhes de diretrizes, consulte `Expert_Agents/Project_Manager/psProjectManager.md`.

---

## 3. MATRIZ DE AGENTES IA (PERSONAS & DADOS)

| ESPECIALISTA | NOME (ID) | FOCO NO INDUSTRYVIEW | PERSONA (DIRETRIZ) | FONTE DE DADOS (PRIMÁRIA) |
| :--- | :--- | :--- | :--- | :--- |
| **Orquestrador** | **psProjectManager** | Coordenação, Governança e Orquestração | `Expert_Agents/Project_Manager/psProjectManager.md` | **`DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/Mestre.xlsx`** |
| Planejamento | **psPlanejamento** | Schedule, Marcos e Curva S | `Expert_Agents/Planejamento/psPlanejamento.md` | **`DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/Mestre.xlsx`** + `DadosProjeto/Dados de Entrada/Planilha Mestre - PDE/PD_ATK_102_25_REV02_R3_Consolidada.xlsb` |
| Engenharia | **psEngenharia** | Specs, BOM e Controle de Documentos | `Expert_Agents/Engenharia/psEngenharia.md` | `DadosProjeto/Dados de Entrada/Proposta Técnica/PT_ATK_102_25_REV02_R0_Consolidada.pdf` + `DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/ListaEncaminhamento.xlsx` |
| Almoxarifado | **psAlmoxarifado** | Materiais e Cadeia de Suprimentos | `Expert_Agents/Almoxarifado/psAlmoxarifado.md` | `DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/MatriaisATK.xlsx` |
| RH / Mobilização | **psRH** | Cadastro e Gestão de Pessoal | `Expert_Agents/RH/psRH.md` | `DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/Planej_Recrutamento.xlsx` |
| EHS (Segurança) | **psEHS** | Riscos, Treinamentos e NRs | `Expert_Agents/EHS/psEHS.md` | `DadosProjeto/Dados de Entrada/Proposta Técnica/PT_ATK_102_25_REV02_R0_Consolidada.pdf` (Seção SSMA) |
| Ferramental | **psFerramental** | Equipamentos e Ferramental | `Expert_Agents/Ferramental/psFerramental.md` | `DadosProjeto/Dados de Entrada/Documentos Internos/Dados de Entrada/Planej_LOG.xlsx` |
| Analista QA | **psAnalistaQA** | Testes, UX e Regras de Negócio | `Expert_Agents/Analista_QA/psAnalistaQA.md` | Logs e Telas do Sistema |

---

## 4. FLUXO DE TRABALHO PADRÃO

Para cada tarefa de cadastro ou automação:

1. **Mapeamento** — O especialista lê sua `Persona.md` e identifica os campos necessários no IndustryView
2. **Análise** — O especialista processa a planilha/PDF correspondente e extrai os dados estruturados
3. **Entrega** — A IA formata os dados para cadastro (tabelas, blocos de texto) OU executa o bot de automação
4. **Validação humana** — O usuário revisa no browser (bots rodam com `headless: false`) antes de confirmar

---

## 5. ACESSO AO INDUSTRYVIEW

- **URL:** `https://industryview.doublex.ai/dashboard`
- **Credenciais:** Configuradas no arquivo `.env` na raiz do projeto (nunca no código)
- **Variáveis obrigatórias:** `INDUSTRYVIEW_LOGIN` e `INDUSTRYVIEW_PASSWORD`

---

## 6. SETUP DO AMBIENTE

```bash
# Dependências Node.js (Puppeteer, xlsx, dotenv)
cd Shared_Lib && npm install

# Configurar credenciais
cp .env.example .env
# Preencher INDUSTRYVIEW_LOGIN e INDUSTRYVIEW_PASSWORD no .env
```

Para bots Python: `selenium`, `openpyxl` e `python-dotenv` devem estar instalados no ambiente Python ativo.

---

## 7. EXECUTAR BOTS

> **IMPORTANTE:** Os módulos Node.js estão instalados em `Shared_Lib/`. Use `NODE_PATH` ao executar da raiz do projeto.

**Node.js (Puppeteer) — a partir da raiz do projeto:**
```bash
NODE_PATH="Shared_Lib/node_modules" node Expert_Agents/Project_Manager/Bots/Bot.js
NODE_PATH="Shared_Lib/node_modules" node Expert_Agents/Almoxarifado/Bots/botAlmox.js
```

**Python (Selenium) — a partir da raiz do projeto:**
```bash
python Expert_Agents/Planejamento/Bots/check_projects.py
python Expert_Agents/Planejamento/Bots/explore_planning.py
python Expert_Agents/Almoxarifado/Bots/fetch_inventory.py
python Expert_Agents/Almoxarifado/Bots/register_material_verified.py
python Expert_Agents/Analista_QA/Bots/intelligent_navigator.py
python Expert_Agents/Analista_QA/Bots/human_mimic.py
```

---

## 8. PADRÕES DE DESENVOLVIMENTO DOS BOTS

**Seleção de elementos:** Usar estratégias em cascata — CSS selector → XPath → busca por label — para resistir a mudanças de UI do IndustryView.

**Upsert:** Buscar item existente → deletar se encontrado → cadastrar novo. Nunca criar duplicatas.

**Formatação monetária:** Locale BR — `toLocaleString('pt-BR')` resulta em `1.234,56`.

**Timing:** Delays explícitos de 1,5–5 segundos entre ações para aguardar a renderização do SPA.

**Carregamento do `.env` em Node.js:** Scripts em `Expert_Agents/*/Bots/` carregam com `require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') })` — aponta para o `.env` na raiz do projeto (3 níveis acima de `Bots/`).

**Módulos Node.js:** Os módulos estão instalados em `Shared_Lib/node_modules` (onde há `package.json`). Executar bots sempre com `NODE_PATH="Shared_Lib/node_modules"` a partir da raiz do projeto.

**Credenciais em scripts Python legados:** Alguns scripts mais antigos podem ter credenciais hardcoded — sempre migrar para `python-dotenv` ao modificar esses arquivos.

---

## 9. DEPENDÊNCIAS

| Pacote | Versão | Uso |
|--------|--------|-----|
| `puppeteer` | ^24.38.0 | Automação de browser (Node.js) |
| `xlsx` | ^0.18.5 | Leitura de planilhas Excel (Node.js) |
| `dotenv` | ^16.4.7 | Variáveis de ambiente (Node.js) |
| `selenium` | — | Automação de browser (Python) |
| `openpyxl` / `pandas` | — | Leitura de planilhas (Python) |
| `python-dotenv` | — | Variáveis de ambiente (Python) |

---

## 10. ESTRUTURA DO REPOSITÓRIO

> **Regras de governança da estrutura:**
> - `Shared_Lib/` é o **único** local de dependências Node.js (`npm install` roda aqui). Não criar `node_modules/` em outros locais.
> - Cada agente tem **um único arquivo de persona** (`psNomeAgente.md`).
> - Arquivos gerados (logs, relatórios) ficam em `Output/` dentro de cada agente.
> - `Bots/` contém apenas scripts ativos — versões obsoletas vão para `Trash/`.

```
/                              ← Raiz: apenas governança e config
├── README.md                  ← BASE PRINCIPAL (este arquivo)
├── CLAUDE.md                  ← Guia técnico para Claude Code
├── GEMINI.md                  ← Guia técnico para Gemini
├── .env                       ← Credenciais locais (nunca versionado)
│
├── DadosProjeto/              ← TODOS os arquivos de entrada do projeto
│   └── Dados de Entrada/
│       ├── Documentos Internos/
│       │   └── Dados de Entrada/        ← FONTES PRIMÁRIAS INTERNAS
│       │       ├── Mestre.xlsx          ← FONTE PRIMÁRIA DE ESCOPO
│       │       ├── MatriaisATK.xlsx     ← psAlmoxarifado
│       │       ├── Planej_Recrutamento.xlsx ← psRH
│       │       ├── Planej_LOG.xlsx      ← psFerramental
│       │       ├── THEO.xlsx            ← (a mapear — sem dono)
│       │       ├── ListaEncaminhamento.xlsx ← psEngenharia
│       │       └── Matriz Responsabilidade.xlsx
│       ├── Planilha Mestre - PDE/
│       │   └── PD_ATK_102_25_REV02_R3_Consolidada.xlsb ← psPlanejamento
│       ├── Proposta Técnica/
│       │   └── PT_ATK_102_25_REV02_R0_Consolidada.pdf  ← psEngenharia / psEHS
│       └── Documentos Externos/
│           └── Documentação_Rev01/Planilha_Equalização/
│               └── 2420-209.EQ.001.xlsx ← psEngenharia (equalização)
│
├── Expert_Agents/             ← Um subdiretório por agente especialista
│   └── [NomeAgente]/
│       ├── ps[NomeAgente].md  ← ÚNICA persona/diretriz do agente
│       ├── Bots/              ← Scripts de automação ativos
│       └── Output/            ← Logs, relatórios e arquivos gerados
│
├── Shared_Lib/                ← Dependências Node.js (ÚNICO node_modules)
│   ├── package.json
│   └── node_modules/
│
├── TelasBrowser/              ← Screenshots do browser (referência visual)
├── TelasApp/                  ← Screenshots do app mobile (referência visual)
└── Trash/                     ← Arquivos obsoletos (limpeza periódica)
```

---

---

## 12. ORQUESTRAÇÃO NO ANTIGRAVITY

O Google Antigravity permite a orquestração de múltiplos agentes de forma assíncrona. Abaixo estão as formas de acionar agentes em diferentes ambientes:

### 12.1 Usando Diferentes Workspaces (Recomendado)
A melhor maneira de evitar conflitos (agentes editando o mesmo arquivo) é separar as tarefas por pastas/projetos.
- No **Agent Manager**, selecione o botão na barra lateral esquerda para abrir um novo workspace.
- Inicie uma nova conversa (agente) nesse novo workspace.
- Isso cria um terminal separado, atrelado àquela pasta, sem interferência mútua.

### 12.2 Múltiplas Conversas no Agent Manager
- Abra o **Agent Manager** (Ctrl+E para alternar).
- Você pode manter várias conversas ativas no painel. Cada chat possui seu próprio contexto.
- Use o terminal do Agent Manager (Ctrl + J) para alternar entre as saídas de cada agente.

### 12.3 Usando "Split Editor" (Dividir Editor)
- Use a configuração de tela dividida para manter o Agent Manager de um lado e um terminal ou arquivo específico do outro, garantindo um ambiente de "Controle de Missão".

### 12.4 Pontos Importantes
- **Terminal do Agente:** Os terminais funcionam para ambientes locais e executam dentro da janela do editor.
- **Comandos de Terminal:** O Antigravity permite configurar comandos para "Always Proceed" (Sempre Prosseguir) ou "Request Review" (Solicitar Revisão) no painel de Modos do Agente.
- **Cuidado com Conflitos:** Se rodar dois agentes no mesmo projeto, divida por preocupações (ex: um cuida do backend, outro do frontend) ou evite que toquem nos mesmos arquivos simultaneamente.

---

## 13. REGRAS DE ATUALIZAÇÃO DESTE DOCUMENTO

- **Qualquer IA** que identificar informação desatualizada ou incorreta neste arquivo deve **sinalizar ao usuário** antes de alterar.
- **Atualizações** devem ser feitas neste README.md como fonte primária; os demais arquivos (`CLAUDE.md`, `GEMINI.md`) devem ser mantidos em sincronia.
- **Conflitos** entre documentos devem ser escalados ao usuário — nunca resolvidos de forma autônoma pela IA.
