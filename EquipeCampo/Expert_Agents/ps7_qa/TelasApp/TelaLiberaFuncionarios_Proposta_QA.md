# QA — TelaAPP: Libera Funcionários

## O que é essa tela

O líder abre o app no início do dia para registrar a chegada de cada trabalhador do seu grupo, lendo o QR Code do crachá de cada um. O app funciona sem internet — salva localmente e sincroniza quando a conexão volta.

---

## Experiência do Usuário

1- Tela não mostra os grupos nem os trabalhadores
2- Botão de QR Code não está associado a nenhum grupo
3- Botão de liberação manual aparece como opção normal na tela
4- Liberação manual não registra o motivo
5- Texto sugere que todo o grupo precisa ser liberado antes de continuar

**Proposta — itens 1 a 5**
Ao abrir a tela, o líder vê os nomes das equipes que coordena naquele dia. Ele seleciona uma equipe e aparecem as tarefas e os nomes dos trabalhadores daquela equipe. Para cada trabalhador, o líder faz a leitura do QR Code do crachá. Se a leitura falhar, o app pergunta se deseja liberar manualmente — com um campo para informar o motivo: falha no QR Code ou perda do crachá. O líder pode liberar os trabalhadores conforme chegam, sem precisar esperar o grupo completo.

---

6- Erro de escrita: "percisa" no lugar de "precisa"
*Falha de conteúdo — corrigir o texto.*

7- Mensagem de estado offline soa como falha técnica
*Design — a mensagem deve informar que o app está funcionando normalmente e que os dados estão salvos no celular.*

8- Contadores numéricos não identificam as pessoas por nome
*Design — os nomes e o status de cada trabalhador já aparecem na proposta dos itens 1 a 5. Os contadores podem permanecer como resumo.*

9- Após a leitura do QR Code, o app não exibe quem foi identificado
*Design — exibir o nome do trabalhador identificado antes de confirmar o registro.*

10- Botão de sair (Log out) posicionado em área de toque fácil
*Design — adicionar confirmação antes de executar o logout.*

11- Contraste do aviso offline pode ser insuficiente para uso ao sol
*Design — verificar e ajustar o contraste para leitura em ambiente externo.*

---
