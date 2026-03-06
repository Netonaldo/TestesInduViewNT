# Requisitos — Tela: Libera Funcionários

**Referência visual:** `TelaLiberaFucnionarios.jpeg`
**Data da análise:** 2026-03-06
**Responsável:** Virginio (Product Owner)
**Status:** Em especificação — aguardando desenvolvimento Frontend

---

## Contexto de Negócio

### Hierarquia de Obra
```
Supervisor / Preposto
    └── Encarregados
            └── Líderes       ← esta tela é para ESTE nível
                    └── Tarefas / Funcionários
```

> **Princípio:** Cada tarefa deve ter apenas **um líder responsável**, evitando o efeito "deixa que eu chuto" ou usar o outro como desculpa.

### O que é "Líder" neste contexto
- **Não é cargo** — é uma **delegação de equipe/tarefa dentro de uma sprint**.
- Um mesmo funcionário pode ser líder de uma equipe em uma sprint e não ser em outra.
- A tela deve estar acessível a quem estiver **com a delegação de líder ativa** no sprint atual.

---

## Comportamento Esperado da Tela (Requisitos Funcionais)

### Ao abrir (pós-login)
A tela inicial do líder deve exibir:
1. **Lista das equipes sob sua liderança** (pode ser mais de uma no mesmo sprint).
2. Para cada equipe: **nome da equipe** + **lista de funcionários alocados**.

### Fluxo de seleção de equipe
1. Líder seleciona **qualquer equipe** na ordem que desejar (sem trava de sequência).
2. Ao selecionar uma equipe → exibe as **tarefas delegadas no sprint** para aquela equipe.
3. Para cada funcionário da equipe → líder realiza a **leitura de QR Code do crachá**.

### Regras de liberação
| Cenário | Ação | Flag |
|---|---|---|
| QR Code lido com sucesso | Funcionário liberado ✅ | — |
| Falha no QR Code | Permite liberação manual | ⚠️ "Problema no QR Code" |
| Crachá perdido | Permite liberação manual | 🚨 "Perda de Crachá" |

> **Regra crítica:** A liberação manual é **somente fallback** — não pode ser a via principal.
> Todo uso de liberação manual deve gerar um **registro auditável** com o motivo.

### Restrição removida (melhoria)
- ❌ **Remover** a trava que impede liberar se nem todos da equipe foram registrados.
- ✅ O líder pode liberar funcionários **individualmente e a qualquer momento**.
- A tela deve mostrar o **progresso parcial** (ex: 3/5 liberados) sem bloquear o fluxo.

---

## Comportamento Offline First (Frontend)

> Registrado para a equipe de Frontend.

- O **"Erro ao sincronizar."** e o botão **"Tentar novamente"** são comportamentos **intencionais** da arquitetura Offline First.
- A tela deve funcionar **sem conexão** — registrando localmente e sincronizando quando a conexão for restabelecida.
- O erro de sincronização **não deve bloquear** o uso da tela — é apenas informativo.
- O snackbar deve indicar claramente que os dados estão **salvos localmente** e serão sincronizados.

**Sugestão de mensagem aprimorada:**
> "Sem conexão. Dados salvos localmente — serão sincronizados automaticamente."

---

## Problemas Detectados na Tela Atual (Prototype)

| # | Tipo | Descrição |
|---|---|---|
| 1 | UX/Fluxo | Tela mostra apenas contadores globais — não exibe equipes nem funcionários alocados |
| 2 | UX/Fluxo | Não há seleção de equipe — líder vai direto para leitura de QR Code sem contexto |
| 3 | Regra de negócio | Libera manualmente como opção primária — deveria ser apenas fallback |
| 4 | Regra de negócio | Ausência de flag para "Perda de Crachá" na liberação manual |
| 5 | UX | Trava implícita: precisa liberar todos antes de avançar (a remover) |
| 6 | Typo | Texto: "percisa" → **"precisa"** |
| 7 | Offline First | Mensagem de erro genérica ("Erro ao sincronizar") — sem indicar que dados estão salvos localmente |

---

## Wireframe Conceitual (textual)

```
┌─────────────────────────────────────────┐
│  Olá, bom dia [Nome]!          [Log out] │
├─────────────────────────────────────────┤
│  🏗️ Suas Equipes — Sprint [X]            │
│                                         │
│  ┌─ Equipe A ──────────────── 3/5 ─────┐│
│  │  João Silva      ☐ QR  ☑ Liberado   ││
│  │  Maria Souza     ☐ QR  ☐ Pendente   ││
│  │  Pedro Lima      ☐ QR  ☐ Pendente   ││
│  └───────────────────────────[Liberar▶]┘│
│                                         │
│  ┌─ Equipe B ──────────────── 0/4 ─────┐│
│  │  (recolhido — toque para expandir)   ││
│  └─────────────────────────────────────┘│
│                                         │
│  [📷 Ler QR Code]                       │
│                                         │
│  ⚠️ Offline — salvando localmente        │
└─────────────────────────────────────────┘
```

---

## Para o Agente QA

Ver análise completa em `TelasApp/TelaLiberaFuncionarios_QA.md` (a ser gerado pelo psAnalistaQA).
