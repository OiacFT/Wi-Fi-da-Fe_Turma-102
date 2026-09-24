# Wi-Fi da Fé

## Descrição
Plataforma web que centraliza informações sobre cursos de graduação, práticas de formação e prazos da PUC-Campinas, hoje dispersas entre e-mails, avisos e o site institucional. Projeto acadêmico sem fins lucrativos (Terceiro Setor), alinhado à ODS 4 (Educação de Qualidade) e ODS 9 (Indústria, Inovação e Infraestrutura).

## Tecnologias Utilizadas (Sprint 1)
- HTML5 semântico
- CSS3 (Flexbox, Grid, responsividade mobile-first)
- JavaScript (comportamento de interface e persistência de dados)
- **Persistência local (localStorage)** — cadastro, login, cursos salvos e mensagens de contato ficam armazenados apenas no navegador do usuário. **Este projeto não utiliza banco de dados, back-end nem API.**

## Estrutura do Projeto

```
pratica/
├── index.html              → Tela inicial
├── src/
│   ├── pages/               → Telas HTML separadas
│   │   ├── login.html
│   │   ├── cadastro.html
│   │   ├── cursos.html          → Busca e filtros de cursos/práticas de formação
│   │   ├── curso-detalhe.html   → Detalhes de um curso/prática específica
│   │   ├── avisos.html          → Central de avisos e prazos
│   │   ├── perfil.html          → Perfil do usuário (lido do localStorage)
│   │   ├── sobre.html           → Sobre o projeto (problema, missão, ODS)
│   │   └── contato.html         → Fale conosco
│   ├── styles/
│   │   ├── variables.css        → Tokens de cor, fonte e espaçamento
│   │   └── main.css             → Estilos gerais (navbar, cards, formulários, tabelas)
│   └── scripts/
│       ├── storage.js           → Funções de leitura/escrita no localStorage (usuário, cursos salvos, mensagens)
│       └── main.js              → Comportamento de interface (menu mobile)
├── assets/
│   └── img/                 → Imagens e ícones
├── docs/
│   ├── prototipo/           → Capturas de tela do protótipo (9 telas)
│   └── 2a_Entrega_Wi-Fi_da_Fe.docx → Documento da 2ª entrega preenchido
└── README.md
```

## Persistência de dados (sem back-end)
Todos os dados do usuário são salvos com a Web Storage API do navegador (`localStorage`), via `src/scripts/storage.js`:
- **Cadastro/Login**: `cadastro.html` grava o usuário; `login.html` confere o e-mail salvo (simulação de autenticação, sem servidor).
- **Cursos salvos**: `curso-detalhe.html` → "Salvar interesse" adiciona o curso à lista exibida em `perfil.html`.
- **Contato**: `contato.html` registra a mensagem localmente (para contato real, usar o e-mail informado na página).

Os dados não saem do navegador do usuário e são perdidos se o `localStorage` for limpo.

## Protótipo
Protótipo interativo (Figma Make): https://www.figma.com/make/cEJHfMpYyU8SYLpI377asE/Wi-Fi-da-Fe-Prototype

## Documento da 2ª Entrega
Modelo preenchido (protótipo, Scrum, Kanban, implementação): `docs/2a_Entrega_Wi-Fi_da_Fe.docx` — sem menções a banco de dados/back-end.

## Gestão do projeto
- Jira: projeto "Wi-Fi da Fé - Turma 102" (Backlog + Sprint 1 + Quadro Kanban).
- Repositório GitHub do grupo: https://github.com/OiacFT/Wi-Fi-da-Fe_Turma-102

## Funcionalidades mapeadas (1ª entrega)
1. Cadastro e Login de usuário (via localStorage)
2. Busca e filtros de cursos e práticas de formação (área, modalidade, período)
3. Central de avisos e prazos
4. Painel de atualização de informações (responsáveis) — próxima sprint
5. Página de detalhes de curso/prática de formação
6. Perfil do usuário (cursos de interesse salvos no navegador)

## Integrantes — Turma 102
- Caio Fernandes Taques – RA: 26002282
- Daniel de Almeida Freitas Junior – RA: 26010866
- Marcio Rosati Bariotto Filho – RA: 26007147
- Mauricio Cunha Tamayo – RA: 26006517
- Pedro Belinassi Barbieri – RA: 26002019
- Roberto Reis da Mata Filho – RA: 26018001

## Status do Projeto
Em desenvolvimento — Sprint 1 (protótipo + 9 telas em HTML/CSS + persistência local).
Próxima entrega: validação de formulários com JavaScript, painel de atualização de informações e refinamentos visuais.
