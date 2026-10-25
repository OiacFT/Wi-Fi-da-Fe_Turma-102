# Wi-Fi da Fé

Plataforma web que centraliza informações sobre cursos de graduação, práticas de formação e prazos da PUC-Campinas, hoje dispersas entre e-mails, avisos e o site institucional. Projeto acadêmico sem fins lucrativos (Terceiro Setor), alinhado à ODS 4 (Educação de Qualidade) e ODS 9 (Indústria, Inovação e Infraestrutura).

## Tecnologias (3ª Entrega)
- HTML5 semântico
- CSS3 (Flexbox, Grid, responsividade mobile-first)
- JavaScript (eventos, manipulação do DOM, validação de formulários e persistência de dados)
- **Web Storage (localStorage e sessionStorage)**: conta, cursos salvos, mensagens de contato e avisos lidos ficam no navegador do usuário; a sessão de login fica no `sessionStorage` (ou no `localStorage`, se marcado "Manter conectado"). Este projeto não utiliza banco de dados, back-end nem API.

## Como executar
1. Baixe ou clone o repositório.
2. Abra `index.html` no navegador (ele redireciona para `src/pages/index.html`). Opcionalmente, sirva a pasta com `python -m http.server 5500` e acesse `http://localhost:5500`.
3. Para a demonstração: crie uma conta em *Criar conta*, abra um curso em *Cursos*, use *Salvar interesse* e confira o resultado em *Perfil*.

## Estrutura do repositório

```
index.html                → Redirecionamento para src/pages/index.html
src/
├── pages/                → Todas as telas do site
│   ├── index.html           → Tela inicial (cursos em destaque e próximos prazos gerados por JS)
│   ├── login.html           → Login simulado com validação
│   ├── cadastro.html        → Cadastro com validação e indicador de força da senha
│   ├── cursos.html          → Busca e filtros em tempo real
│   ├── curso-detalhe.html   → Detalhes de um curso (lê ?id= da URL)
│   ├── avisos.html          → Central de avisos e prazos (filtros e "marcar como lido")
│   ├── perfil.html          → Perfil do usuário (acesso restrito à sessão)
│   ├── painel.html          → Painel de responsáveis (adicionar, editar e excluir cursos e avisos)
│   ├── sobre.html           → Sobre o projeto (problema, missão, ODS e FAQ)
│   └── contato.html         → Fale conosco (validação e contador de caracteres)
├── styles/
│   ├── variables.css        → Tokens de cor, fonte e espaçamento
│   └── main.css             → Estilos gerais (navbar, cards, formulários, tabelas, estados e responsividade)
└── scripts/
    ├── dados.js             → Dados simulados de cursos e avisos
    ├── storage.js           → Leitura/escrita no localStorage e sessionStorage
    ├── validacao.js         → Regras e mensagens de validação dos formulários
    ├── main.js              → Menu mobile, área do usuário, funções de apoio e acordeão (FAQ)
    └── home.js, cursos.js, curso-detalhe.js, avisos.js,
        login.js, cadastro.js, perfil.js, painel.js, contato.js → Um script por tela
assets/
└── img/                  → Imagens e ícones
docs/
├── prototipo/                  → Capturas de tela do protótipo (9 telas)
├── evidencias-3a-entrega/      → Capturas da aplicação em execução (desktop, tablet e celular)
├── roteiro-teste-usabilidade.md → Roteiro do teste de usabilidade com estudantes (4ª entrega)
├── 2a_Entrega_Wi-Fi_da_Fe.docx / .pdf → Documento da 2ª entrega
└── 3a_Entrega_Wi-Fi_da_Fe.docx / .pdf → Documento da 3ª entrega
```

## Interações em JavaScript
- **Cursos**: busca por nome (sem diferenciar acentos) e filtros por área, modalidade e período em tempo real, com contador de resultados e filtros lembrados no `sessionStorage`.
- **Detalhes do curso**: conteúdo montado a partir do parâmetro `?id=`; botão *Salvar interesse* / *Remover dos salvos* (exige login).
- **Avisos**: status calculado pela data (Encerrado, Urgente, Em breve, Em dia), filtros por categoria e status e *Marcar como lido*.
- **Cadastro, login, contato e edição de perfil**: mensagens de erro por campo (`aria-invalid`), correção em tempo real, mostrar/ocultar senha e indicador de força da senha.
- **Perfil**: acesso restrito sem sessão, edição dos dados, status de cada curso salvo, sair e excluir dados locais.
- **Sobre**: perguntas frequentes em acordeão.
- **Painel de responsáveis**: contas do tipo "Responsável por cursos e prazos" (escolhido no cadastro) adicionam, editam e excluem cursos e avisos, com validação. As alterações aparecem em Início, Cursos, Detalhes e Avisos e podem ser desfeitas com "Restaurar dados de exemplo".

Os dados não saem do navegador do usuário e são perdidos se o armazenamento for limpo. A senha nunca é armazenada e o login é uma simulação sem servidor.

## Protótipo
Protótipo interativo (Figma Make): https://www.figma.com/make/cEJHfMpYyU8SYLpI377asE/Wi-Fi-da-Fe-Prototype

## Documentos das entregas
- 2ª Entrega (protótipo, planejamento Scrum e início da implementação): [`docs/2a_Entrega_Wi-Fi_da_Fe.pdf`](docs/2a_Entrega_Wi-Fi_da_Fe.pdf)
- 3ª Entrega (consolidação da implementação): [`docs/3a_Entrega_Wi-Fi_da_Fe.pdf`](docs/3a_Entrega_Wi-Fi_da_Fe.pdf)

## Gestão do projeto
- Jira: projeto "Wi-Fi da Fé - Turma 102" (Backlog, Sprints 0 a 2, Quadro Kanban e versões Release 1.0 a 2.0).
- Repositório GitHub do grupo: https://github.com/OiacFT/Wi-Fi-da-Fe_Turma-102

## Funcionalidades mapeadas (1ª entrega)
1. Cadastro e Login de usuário (via localStorage): implementada
2. Busca e filtros de cursos e práticas de formação (área, modalidade, período): implementada
3. Central de avisos e prazos: implementada
4. Painel de atualização de informações (responsáveis): implementada
5. Página de detalhes de curso/prática de formação: implementada
6. Perfil do usuário (cursos de interesse salvos no navegador): implementada

## Integrantes — Turma 102
- Caio Fernandes Taques – RA: 26002282
- Daniel de Almeida Freitas Junior – RA: 26010866
- Marcio Rosati Bariotto Filho – RA: 26007147
- Mauricio Cunha Tamayo – RA: 26006517
- Pedro Belinassi Barbieri – RA: 26002019
- Roberto Reis da Mata Filho – RA: 26018001

## Status do projeto
3ª Entrega: front-end consolidado, com as 10 telas funcionais (incluindo o painel de responsáveis), navegação operacional, layout responsivo e interações em JavaScript.
Próximas etapas: testes de usabilidade com estudantes, documentação de bugs e entrega final.
