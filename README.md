# Wi-Fi da Fé

## Descrição
Plataforma web que centraliza informações sobre cursos de graduação, práticas de formação e prazos da PUC-Campinas, hoje dispersas entre e-mails, avisos e o site institucional. Projeto acadêmico sem fins lucrativos (Terceiro Setor), alinhado à ODS 4 (Educação de Qualidade) e ODS 9 (Indústria, Inovação e Infraestrutura).

## Tecnologias Utilizadas (Sprint 1)
- HTML5 semântico
- CSS3 (Flexbox, Grid, responsividade mobile-first)
- JavaScript (comportamento inicial — menu mobile)
- Próximas etapas: banco de dados e back-end para cadastro/autenticação

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
│   │   └── perfil.html          → Perfil do usuário
│   ├── styles/
│   │   ├── variables.css        → Tokens de cor, fonte e espaçamento
│   │   └── main.css             → Estilos gerais (navbar, cards, formulários, tabelas)
│   └── scripts/
│       └── main.js              → Comportamento inicial (menu mobile)
├── assets/
│   └── img/                 → Imagens e ícones
├── docs/
│   └── prototipo/           → Protótipo Figma (prints/exportações)
└── README.md
```

## Protótipo
Protótipo interativo (Figma Make): https://www.figma.com/make/cEJHfMpYyU8SYLpI377asE/Wi-Fi-da-Fe-Prototype
Capturas de tela: ver `docs/prototipo/`.

## Documento da 2ª Entrega
Modelo preenchido (protótipo, Scrum, Kanban, implementação): `docs/2a_Entrega_Wi-Fi_da_Fe.docx` (ainda não enviado ao Canvas — revisar com o grupo antes do envio).

## Gestão do projeto
- Jira: projeto "Wi-Fi da Fé - Turma 102" (Backlog + Sprint 1 + Quadro Kanban).
- Repositório GitHub do grupo: https://github.com/OiacFT/Wi-Fi-da-Fe_Turma-102 (repositório existente com páginas antigas — recomenda-se substituir pelo conteúdo desta pasta `pratica/`).

## Funcionalidades mapeadas (1ª entrega)
1. Cadastro e Login de usuário
2. Busca e filtros de cursos e práticas de formação (área, modalidade, período)
3. Central de avisos e prazos
4. Painel de atualização de informações (responsáveis) — próxima sprint
5. Página de detalhes de curso/prática de formação
6. Perfil do usuário (cursos de interesse/inscritos)

## Integrantes — Turma 102
- Caio Fernandes Taques – RA: 26002282
- Daniel de Almeida Freitas Junior – RA: 26010866
- Marcio Rosati Bariotto Filho – RA: 26007147
- Mauricio Cunha Tamayo – RA: 26006517
- Pedro Belinassi Barbieri – RA: 26002019
- Roberto Reis da Mata Filho – RA: 26018001

## Status do Projeto
Em desenvolvimento — Sprint 1 (protótipo + telas iniciais em HTML/CSS).
Próxima entrega: banco de dados, back-end de autenticação e validação de formulários com JavaScript.
