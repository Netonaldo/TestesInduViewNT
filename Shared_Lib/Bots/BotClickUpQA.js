/**
 * BotClickUpQA.js — Cria 1 task consolidada no ClickUp com os issues do QA
 * Uso: NODE_PATH="Shared_Lib/node_modules" node Shared_Lib/Bots/BotClickUpQA.js <caminho_issues.json>
 *
 * Hierarquia ClickUp:
 *   Workspace: Doublex - Oficial
 *     └── Space: Sunview Pro (atk)
 *           └── List: "List"
 *                 └── Status: "TESTE NETO"
 */

const path = require('path')
const fs   = require('fs')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const TOKEN      = process.env.CLICKUP_TOKEN
const SPACE_NOME = 'Sunview Pro (atk)'
const STATUS     = 'TESTE NETO'
const jsonArg    = process.argv[2]

if (!TOKEN)   { console.error('❌ CLICKUP_TOKEN não encontrado no .env'); process.exit(1) }
if (!jsonArg) { console.error('❌ Informe o caminho do _issues.json'); process.exit(1) }

const ISSUES = JSON.parse(fs.readFileSync(path.resolve(jsonArg), 'utf8'))

async function api(method, url, body) {
  const res = await fetch(`https://api.clickup.com/api/v2${url}`, {
    method,
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${res.status} — ${await res.text()}`)
  return res.json()
}

async function main() {
  const { teams } = await api('GET', '/team')
  const { spaces } = await api('GET', `/team/${teams[0].id}/space?archived=false`)
  const space = spaces.find(s => s.name === SPACE_NOME)
  const { lists } = await api('GET', `/space/${space.id}/list?archived=false`)
  const lista = lists[0]

  const nome = `QA ${ISSUES[0]?.tela || 'Análise'}`
  const descricao = ISSUES.map((issue, i) =>
    `${i + 1}- ${issue.nome.replace(/^\[QA-\d+\]\s*/, '')}`
  ).join('\n')

  const task = await api('POST', `/list/${lista.id}/task`, {
    name: nome,
    status: STATUS,
    description: descricao,
  })

  console.log(`✅ Task criada → ${task.url}`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
