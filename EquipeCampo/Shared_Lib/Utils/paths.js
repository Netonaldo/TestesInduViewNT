const path = require('path');

/**
 * Utilitário central de caminhos para o projeto ATK_102_25.
 * Evita o uso de "../../.." espalhado pelos scripts.
 */

const ROOT = path.resolve(__dirname, '..', '..', '..');
const EQUIPE_CAMPO = path.join(ROOT, 'EquipeCampo');
const SHARED_LIB = path.join(EQUIPE_CAMPO, 'Shared_Lib');
const EXPERT_AGENTS = path.join(EQUIPE_CAMPO, 'Expert_Agents');
const DADOS_PROJETO = path.join(ROOT, 'DadosProjeto');

module.exports = {
    ROOT,
    EQUIPE_CAMPO,
    SHARED_LIB,
    EXPERT_AGENTS,
    DADOS_PROJETO,
    ENV_PATH: path.join(ROOT, '.env'),
    
    // Atalhos para agentes comuns
    getAgentPath: (agentName) => path.join(EXPERT_AGENTS, agentName),
    getAgentBotsPath: (agentName) => path.join(EXPERT_AGENTS, agentName, 'Bots'),
    getAgentOutputPath: (agentName) => path.join(EXPERT_AGENTS, agentName, 'Output'),
    
    // Pasta de evidências (agora centralizada no QA)
    SCREENSHOTS_APP: path.join(EXPERT_AGENTS, 'ps7_qa', 'TelasApp'),
    SCREENSHOTS_BROWSER: path.join(EXPERT_AGENTS, 'ps7_qa', 'TelasBrowser'),
};
