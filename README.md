# README.md — HUB CENTRAL ATK_102_25 (SADA EBER)

> [!IMPORTANT]
> **ESTA É A FONTE DE VERDADE MESTRE.**
> Para detalhes técnicos de execução, consulte sempre a [psArch (Engenharia)](./EquipeCampo/Shared_Lib/DIRETRIZES_TECNICAS.md).

---

## 1. INFORMAÇÕES DO PROJETO
- **Projeto:** ATK_102_25 - SADA EBER (Montagem Processo Milho)
- **Escopo:** Montagem e QA de cadastro no IndustryView.
- **SSoT (Dados):** `DadosProjeto/Dados de Entrada/Documentos Internos/Mestre.xlsx`.

---

## 2. GOVERNANÇA E AGENTES
A orquestração do projeto é realizada pelo **ps0_pm** ([ps0_pm.md](./EquipeCampo/Expert_Agents/ps0_pm/ps0_pm.md)).

| ESPECIALISTA | NOME (ID) | DOMÍNIO DE EXECUÇÃO | PERSONA |
| :--- | :--- | :--- | :--- |
| **Orquestrador** | **ps0_pm** | Governança e Delegação | [ps0_pm.md](./EquipeCampo/Expert_Agents/ps0_pm/ps0_pm.md) |
| Planejamento | **ps1_plan** | Schedule e Cronograma | [ps1_plan.md](./EquipeCampo/Expert_Agents/ps1_plan/ps1_plan.md) |
| Engenharia | **ps2_eng** | Specs e Controle de Documentos | [ps2_eng.md](./EquipeCampo/Expert_Agents/ps2_eng/ps2_eng.md) |
| Almoxarifado | **ps4_almox** | Materiais e Suprimentos | [ps4_almox.md](./EquipeCampo/Expert_Agents/ps4_almox/ps4_almox.md) |
| Detalhamento | **ps9_EngDetail** | Instrumentação e Campo | [ps9_EngDetail.md](./EquipeCampo/Expert_Agents/ps9_EngDetail/ps9_EngDetail.md) |
| Analista QA | **ps7_qa** | Validação e Captura de Telas | [ps7_qa.md](./EquipeCampo/Expert_Agents/ps7_qa/ps7_qa.md) |
| **Arquiteto** | **psArch** | **Infraestrutura e Padronização** | [psArch.md](./EquipeCampo/Expert_Agents/psArch/psArch.md) |

---

## 3. DIRETRIZES RÁPIDAS (LINKS)
Para evitar redundância e consumo de tokens, consulte os documentos específicos:

1.  **Como rodar Bots / Padrões de Código?** -> **[DIRETRIZES_TECNICAS.md](./EquipeCampo/Shared_Lib/DIRETRIZES_TECNICAS.md)**
2.  **Onde estão as imagens de QA?** -> `EquipeCampo/Expert_Agents/ps7_qa/TelasApp` ou `TelasBrowser`.
3.  **Credenciais?** -> Arquivo `.env` na raiz (não versionado).

---

## 4. ESTRUTURA RESUMIDA
```
/DadosProjeto/        <- Fontes de Dados (SSoT)
/EquipeCampo/         <- Hub de Inteligência
  /Expert_Agents/     <- Agentes Especialistas e seus Bots
  /Shared_Lib/        <- Dependências e [Diretrizes Técnicas](./EquipeCampo/Shared_Lib/DIRETRIZES_TECNICAS.md)
/Trash/               <- Arquivos temporários ou obsoletos
```

---
*README reduzido para máxima eficiência de leitura por IA. Consulte os especialistas para detalhes.*
