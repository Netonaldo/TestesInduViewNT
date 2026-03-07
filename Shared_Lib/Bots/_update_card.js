const path = require('path')
const fs   = require('fs')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const TOKEN   = process.env.CLICKUP_TOKEN
const TASK_ID = process.argv[2]
const jsonArg = process.argv[3]

if (!TOKEN || !TASK_ID || !jsonArg) {
  console.error('Uso: node _update_card.js <task_id> <issues.json>')
  process.exit(1)
}

const issues = JSON.parse(fs.readFileSync(path.resolve(jsonArg), 'utf8'))
const descricao = issues.map((issue, i) =>
  `${i + 1}- ${issue.nome.replace(/^\[QA-\d+\]\s*/, '')}`
).join('\n')

fetch(`https://api.clickup.com/api/v2/task/${TASK_ID}`, {
  method: 'PUT',
  headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ description: descricao }),
})
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
  .then(t => console.log('✅ Card atualizado →', t.url))
  .catch(e => { console.error('❌', e.message); process.exit(1) })
