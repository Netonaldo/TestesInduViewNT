# DIRETRIZES_TECNICAS.md — PADRÕES DE ENGENHARIA

Este documento contém a base técnica obrigatória para todos os bots do projeto. Gerenciado pelo **psArch**.

## 1. AMBIENTE DE EXECUÇÃO
- **Runtime:** Node.js (versão 18+)
- **Dependências:** Localizadas exclusivamente em `Shared_Lib/node_modules`.
- **Comando de Execução:** `NODE_PATH="Shared_Lib/node_modules" node path/to/bot.js`

## 2. PADRÕES DE CÓDIGO (BOTS)
- **Framework:** Puppeteer (Headless: `false` por padrão).
- **Caminhos:** Obrigatório o uso de `Shared_Lib/Utils/paths.js`.
```javascript
const paths = require('../../../Shared_Lib/Utils/paths');
require('dotenv').config({ path: paths.ENV_PATH });
```
- **Upsert:** Sempre verificar existência antes de cadastrar para evitar duplicatas.
- **Seleção de Elementos:** Cascata (CSS -> XPath Label -> Placeholder).

## 3. INFRAESTRUTURA
- **Credenciais:** Somente via `.env` na raiz.
- **Evidências:** Screenshots devem ser salvos em `Expert_Agents/ps7_qa/TelasApp` ou `TelasBrowser`.
- **Logs:** Resultados de execução em `Expert_Agents/[Agente]/Output/`.

---
*Consulte o psArch para dúvidas sobre arquitetura.*
