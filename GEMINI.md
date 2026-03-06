# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

> [!IMPORTANT]
> **README.md é a fonte de verdade única deste projeto.** Consulte-o sempre ao iniciar uma sessão.
> Em caso de divergência entre documentos, acione o usuário antes de prosseguir.

👉 **[README.md](./README.md)** — Governança, matriz de agentes, fluxo de trabalho e padrões técnicos.

---

## Setup

```bash
# Instalar dependências Node.js (único local válido — nunca instalar em outro diretório)
cd Shared_Lib && npm install
```

Credenciais ficam no `.env` na **raiz do projeto** (nunca versionado). Variáveis obrigatórias:
```
INDUSTRYVIEW_LOGIN=
INDUSTRYVIEW_PASSWORD=
OPENAI_API_KEY=
```

---

## Executar Bots

**Sempre executar da raiz do projeto.**

### Node.js (Puppeteer)
```bash
NODE_PATH="Shared_Lib/node_modules" node Expert_Agents/Project_Manager/Bots/Bot.js
NODE_PATH="Shared_Lib/node_modules" node Expert_Agents/Almoxarifado/Bots/botAlmox.js
```

### Python (Selenium)
```bash
python Expert_Agents/Planejamento/Bots/check_projects.py
python Expert_Agents/Planejamento/Bots/explore_planning.py
python Expert_Agents/Almoxarifado/Bots/fetch_inventory.py
python Expert_Agents/Almoxarifado/Bots/register_material_verified.py
python Expert_Agents/Analista_QA/Bots/intelligent_navigator.py
python Expert_Agents/Analista_QA/Bots/human_mimic.py
python Expert_Agents/Analista_QA/Bots/explorer_bot_v2.py
```

### Ferramenta de descoberta de UI (mapeamento de telas)
```bash
# Abre browser visível; clique nos elementos desejados; lê o log gerado em seguida
NODE_PATH="Shared_Lib/node_modules" node Shared_Lib/Bots/BotSpyTela.js
# Output: Shared_Lib/Output/BotSpyTela.log
```

Não há runner de testes nem linter configurado neste projeto.

---

## Arquitetura

### Multi-agente orquestrado

8 personas especialistas (`psXXXXX.md`), cada uma dona de um módulo do IndustryView e de uma fonte de dados específica. O **psProjectManager** é o orquestrador — ele define quem age e quando. Para a tabela de delegação documento→agente, ver `Expert_Agents/Project_Manager/psProjectManager.md`.

**Fluxo de dados:**
```
DadosProjeto/Dados de Entrada/   ← planilhas e PDFs de entrada
        ↓  (persona lê e define regras)
Expert_Agents/[Agente]/ps[Agente].md
        ↓  (bot executa no browser)
Expert_Agents/[Agente]/Bots/
        ↓  (resultado no sistema)
IndustryView (https://industryview.doublex.ai/dashboard)
        ↓  (logs e relatórios)
Expert_Agents/[Agente]/Output/
```

### Dependências Node.js centralizadas

`node_modules` existe **somente** em `Shared_Lib/`. Nunca rodar `npm install` em outro diretório. Scripts em `Expert_Agents/*/Bots/` carregam o `.env` com:
```js
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') })
// Bots/ → Agente/ → Expert_Agents/ → raiz (3 níveis acima)
```

### Bots Python — credenciais legadas

Bots Python mais antigos têm credenciais **hardcoded** (legacy). Ao modificar qualquer bot Python, migrar para `python-dotenv`:
```python
from dotenv import load_dotenv
load_dotenv()  # carrega o .env da raiz (sempre rodar da raiz do projeto)
```

---

## Padrões de desenvolvimento de bots

**Modo headless:**
- Node.js: `headless: false` — browser visível para revisão humana antes de salvar
- Python: `headless: true` — execução silenciosa

**Upsert (nunca criar duplicatas):**
Buscar item existente → deletar se encontrado → cadastrar novo.

**Seleção de elementos (cascata):**
CSS selector → XPath por placeholder → XPath por label → clique direto no input.

**Moeda BR:** `valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })`

**Output dos bots:** Logs e screenshots ficam em `Expert_Agents/[Agente]/Output/`. A pasta é criada on-demand pelo bot — não criar manualmente nem commitar vazia.
