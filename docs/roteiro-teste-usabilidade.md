# Roteiro do teste de usabilidade com usuários (Wi-Fi da Fé)

Este roteiro serve para o teste com estudantes (Jira: SCRUM-48), que estava previsto desde a 3ª entrega e foi aplicado em 20 e 21/11/2026. Ele não substitui a avaliação de usabilidade feita pelo grupo na 3ª entrega (ver seção 6.3 do documento), que usou medições automáticas e não envolveu usuários.

## Preparação
- Testes: 4 fichas. Na aplicação real foram 3 estudantes da PUC-Campinas que não participaram do projeto e 1 piloto automatizado (ver `teste-usabilidade/resultados-teste-usabilidade.md`).
- Ambiente: o site aberto no navegador (`index.html`), com o armazenamento do navegador limpo antes de cada participante. Se possível, metade das pessoas no computador e metade no celular.
- Quem aplica o teste lê a tarefa, não dá dicas e anota o que a pessoa faz. Quem testa é o site, não o participante.

## Tarefas
| # | Tarefa dita ao participante | Caminho esperado | Sucesso se |
|---|-----------------------------|------------------|------------|
| 1 | "Descubra até quando é a matrícula de Engenharia da Computação." | Início, Cursos, busca, Ver detalhes | A pessoa lê a data (28/10/2026) nos prazos do curso |
| 2 | "Veja quais avisos estão urgentes." | Avisos, filtro de status Urgente | A lista mostra só os urgentes |
| 3 | "Crie uma conta, salve o curso de Psicologia e confira no seu perfil." | Criar conta, Cursos, Detalhes, Salvar interesse, Perfil | O curso aparece na tabela do Perfil |
| 4 | "Envie uma sugestão para a equipe." | Contato, preencher e enviar | Aparece a mensagem de confirmação |
| 5 | (celular) "Abra a lista de cursos." | Menu, Cursos | A lista de cursos abre |
| 6 | (responsável) "Cadastre um aviso de prazo novo." | Painel, preencher e adicionar | O aviso aparece na lista do painel e em Avisos |

## O que registrar para cada tarefa
- Concluiu sozinho? (sim, com dica, não)
- Tempo gasto, em segundos.
- Número de erros (cliques ou caminhos errados, mensagens de erro de formulário).
- Frase dita em voz alta que mostre dúvida ("onde fica...?", "não entendi...").

## Perguntas finais (nota de 1 a 5, 1 = discordo totalmente, 5 = concordo totalmente)
1. Foi fácil descobrir o que fazer em cada tela.
2. As mensagens de erro me ajudaram a corrigir o que estava errado.
3. A aparência do site me pareceu organizada e agradável.
4. Eu usaria um site assim para acompanhar prazos da faculdade.
5. No celular, os botões e textos foram fáceis de usar. (só para quem testou no celular)

E duas perguntas abertas: "O que mais atrapalhou?" e "O que você mudaria primeiro?"

## Tabela de registro (copiar uma por participante)
| Tarefa | Concluiu (sim / com dica / não) | Tempo (s) | Erros | Observações |
|--------|----------------------------------|-----------|-------|-------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

## Como analisar
- Taxa de sucesso por tarefa (meta: pelo menos 3 de 4 testes com a tarefa concluída sozinha).
- Tarefas com mais tempo e mais erros viram itens no Jira, em ordem de prioridade.
- Anotar no documento o que foi mudado por causa do teste e o resultado depois da mudança.

## Material pronto para aplicar o teste
- `teste-usabilidade/ficha-teste-usabilidade.pdf` (e `.docx`): ficha de observação de 2 páginas, uma por participante, com a fala de abertura, as tarefas, a tabela de registro, as perguntas finais e as perguntas abertas.
- `teste-usabilidade/tarefas.csv` e `teste-usabilidade/notas.csv`: planilhas vazias, só com o cabeçalho. Preencher uma linha por participante e tarefa (tarefas.csv; resultado = sim, com dica ou nao) e uma linha por participante (notas.csv).
- `../testes/analisar_usabilidade.py`: lê as duas planilhas e imprime as tabelas de resultado (taxa de sucesso sem ajuda, tempo médio, erros e média das notas) já em formato Markdown, para colar na seção 6 do documento.

## Depois do teste
1. Passar as marcações das fichas para as planilhas CSV.
2. Rodar `python testes/analisar_usabilidade.py` na pasta do projeto.
3. Cada tarefa abaixo da meta vira um item no Jira, em ordem de prioridade; no documento, registrar o que foi mudado e o resultado depois da mudança.
