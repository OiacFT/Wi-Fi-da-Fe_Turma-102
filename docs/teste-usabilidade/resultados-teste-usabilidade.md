# Resultados do teste de usabilidade (20 e 21/11/2026)

Resumo anonimizado das 4 fichas de observação recebidas. Os participantes aparecem só pelo número, como a ficha promete; as fichas originais (que trazem nomes) não fazem parte do repositório. Os dados brutos, já sem nomes, estão em `tarefas.csv` e `notas.csv`, e as tabelas abaixo são a saída de `python testes/analisar_usabilidade.py`.

## Quem fez
| Ficha | Quem | Dispositivo e navegador | Data |
| --- | --- | --- | --- |
| P0 | Piloto do grupo com **navegador automatizado** (Chromium, Playwright), sem tempo registrado, com erros provocados de propósito e notas dadas pelo aplicador | Computador e celular emulado | 21/11/2026 |
| P1 | Estudante que não participou do projeto | Computador, Chrome | 21/11/2026 |
| P2 | Estudante que não participou do projeto | Computador, Chrome | 20/11/2026 |
| P3 | Estudante que não participou do projeto | Computador, Edge | 21/11/2026 |

## Limites dos dados
- P0 conta como um dos 4 testes das tarefas, mas não entra nas medianas de tempo nem nas notas.
- P2 não aplicou as tarefas 5 (celular) e 6 (responsável).
- P3 marcou o resultado só da tarefa 2; nas outras há o tempo, mas não o resultado.
- P1 não preencheu a coluna de erros.
- O consentimento e o armazenamento limpo estão marcados só em parte das fichas.
- Esses vazios foram registrados como "sem registro" ou "não aplicada" e não foram preenchidos por suposição.
- Com 3 participantes, o resultado descreve o comportamento do MVP, mas não permite generalizar.

## Tarefas (meta: pelo menos 3 de 4 testes com a tarefa concluída sozinha)
| Tarefa | Sozinho | Com dica | Não concluiu | Sem registro | Não aplicada | Mediana do tempo (s) | Meta |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Descobrir o prazo de matrícula de Engenharia da Computação | 3 | 0 | 0 | 1 | 0 | 5 | atingida |
| 2. Ver os avisos urgentes | 3 | 1 | 0 | 0 | 0 | 3 | atingida |
| 3. Criar conta, salvar Psicologia e conferir no perfil | 3 | 0 | 0 | 1 | 0 | 12 | atingida |
| 4. Enviar uma sugestão para a equipe | 3 | 0 | 0 | 1 | 0 | 3 | atingida |
| 5. Abrir a lista de cursos (celular) | 2 | 0 | 0 | 1 | 1 | 1,5 | abaixo (falta de dados) |
| 6. Cadastrar um aviso novo (responsável) | 2 | 0 | 0 | 1 | 1 | 6,5 | abaixo (falta de dados) |

Nenhuma tarefa foi marcada como não concluída. P2 levou 180 s na tarefa 3 (1 erro) e 300 s na tarefa 4; a ficha não registra o motivo. O piloto P0 observou que o Contato só aparece no rodapé, o que é uma explicação possível, não confirmada. P3 precisou de uma dica na tarefa 2.

## Perguntas finais (P1, P2 e P3; nota de 1 a 5)
| Afirmação | Respostas | Média |
| --- | --- | --- |
| Foi fácil descobrir o que fazer em cada tela | 3 | 5,0 |
| As mensagens de erro ajudaram a corrigir | 3 | 5,0 |
| A aparência pareceu organizada e agradável | 3 | 4,3 |
| Usaria um site assim para acompanhar prazos | 3 | 5,0 |
| No celular, botões e textos foram fáceis de usar | 1 | 5,0 |

## Respostas abertas (resumo)
- O que mais atrapalhou: P1, nada; P3, nenhum incômodo; P2, cores de fundo com pouca diferença do resto.
- O que mudariam primeiro: P1, mais cursos; P2, fundo com degradê ou imagens ligadas à faculdade; P3, animações entre as abas.
- Observação de P3 na tarefa 2: "colocar mais cor".
- P0 (piloto): Contato só no rodapé; filtro Urgente vazio por causa das datas fixas; uma conta por navegador; busca "psicologia" com dois cursos parecidos; áreas de toque pequenas no celular.

## Achados e o que foi feito
| Achado | Quem apontou | O que foi feito ou será feito | Situação |
| --- | --- | --- | --- |
| Filtro Urgente vazio na data do teste (datas de exemplo fixas) | P0; P3 precisou de dica na tarefa 2 | Datas de exemplo calculadas a partir do dia atual (SCRUM-58) | Corrigido em 22/11 |
| Contato só no rodapé, fora do menu principal | P0; possível relação com os 300 s de P2 na tarefa 4 | Colocar Contato no menu principal (SCRUM-59) | Pendente |
| Cores de fundo com pouca diferença; pedido de mais cor | P2 e P3 | Rever as cores de fundo dentro da identidade visual (SCRUM-59) | Pendente |
| Áreas de toque pequenas no rodapé e na caixa de seleção, no celular | P0 | Aumentar as áreas de toque (SCRUM-59) | Pendente |
| Uma conta por navegador | P0 | É a regra RN05 (sem servidor); registrada como limitação | Documentado |
| Busca "psicologia" com 2 cursos parecidos | P0 | Nomes diferentes nos dados de exemplo; sem alteração | Sem ação |
| Mostrar o próximo prazo com a lista vazia | P0 | Melhoria de baixa prioridade | Registrado |
| Animações entre abas, fundo com degradê ou imagens, mais cursos | P3, P2 e P1 | Fora do escopo do MVP; evolução | Registrado |
