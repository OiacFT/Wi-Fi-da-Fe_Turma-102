// Wi-Fi da Fé — dados simulados (3ª Entrega)
// Não há banco de dados nem back-end: os cursos e os avisos abaixo são dados de exemplo
// mantidos no próprio front-end (arrays de objetos) e usados pelas telas para gerar o conteúdo.

const CURSOS = [
  {
    id: "eng-computacao",
    nome: "Engenharia da Computação",
    area: "Tecnologia",
    modalidade: "Graduação",
    periodo: "Integral",
    cargaHoraria: "3.600 horas",
    duracao: "5 anos",
    responsavel: "Prof. Dr. Fernando Silveira",
    resumo: "Formação para atuar no desenvolvimento de software, hardware e sistemas inteligentes, unindo teoria sólida e prática de laboratório.",
    conteudo: ["Algoritmos e Estruturas de Dados", "Desenvolvimento Web e Mobile", "Banco de Dados", "Redes de Computadores", "Inteligência Artificial"],
    destaque: true,
  },
  {
    id: "sistemas-informacao",
    nome: "Sistemas de Informação",
    area: "Tecnologia",
    modalidade: "Graduação",
    periodo: "Noturno",
    cargaHoraria: "3.200 horas",
    duracao: "4 anos",
    responsavel: "Coordenação do curso de Sistemas de Informação",
    resumo: "Curso voltado à análise, ao projeto e à gestão de sistemas que apoiam as decisões e os processos das organizações.",
    conteudo: ["Análise e Projeto de Sistemas", "Engenharia de Software", "Gestão de Projetos", "Banco de Dados", "Governança de TI"],
    destaque: false,
  },
  {
    id: "administracao",
    nome: "Administração",
    area: "Negócios",
    modalidade: "Graduação",
    periodo: "Matutino",
    cargaHoraria: "3.000 horas",
    duracao: "4 anos",
    responsavel: "Coordenação do curso de Administração",
    resumo: "Formação em gestão de pessoas, finanças, marketing e operações, com foco em tomada de decisão e empreendedorismo.",
    conteudo: ["Teoria Geral da Administração", "Contabilidade e Finanças", "Marketing", "Gestão de Pessoas", "Empreendedorismo"],
    destaque: true,
  },
  {
    id: "psicologia",
    nome: "Psicologia",
    area: "Saúde",
    modalidade: "Graduação",
    periodo: "Matutino",
    cargaHoraria: "4.000 horas",
    duracao: "5 anos",
    responsavel: "Coordenação do curso de Psicologia",
    resumo: "Estudo do comportamento humano e dos processos mentais, com formação para atuação clínica, escolar e organizacional.",
    conteudo: ["Psicologia do Desenvolvimento", "Neurociências", "Psicopatologia", "Técnicas de Entrevista", "Ética Profissional"],
    destaque: false,
  },
  {
    id: "direito",
    nome: "Direito",
    area: "Humanas",
    modalidade: "Graduação",
    periodo: "Noturno",
    cargaHoraria: "3.700 horas",
    duracao: "5 anos",
    responsavel: "Coordenação do curso de Direito",
    resumo: "Formação jurídica ampla, com estudo das leis, da argumentação e da prática profissional nas diversas áreas do Direito.",
    conteudo: ["Introdução ao Estudo do Direito", "Direito Constitucional", "Direito Civil", "Direito Penal", "Prática Jurídica"],
    destaque: false,
  },
  {
    id: "estagio-psicologia",
    nome: "Estágio em Psicologia Clínica",
    area: "Saúde",
    modalidade: "Prática de Formação",
    periodo: "Noturno",
    cargaHoraria: "200 horas",
    duracao: "1 semestre",
    responsavel: "Supervisão de estágio em Psicologia",
    resumo: "Prática supervisionada de atendimento e acolhimento em contexto clínico, com acompanhamento semanal de um docente.",
    conteudo: ["Acolhimento e escuta", "Registro de atendimentos", "Supervisão em grupo", "Ética no atendimento"],
    destaque: true,
  },
  {
    id: "estagio-administracao",
    nome: "Estágio em Administração",
    area: "Negócios",
    modalidade: "Prática de Formação",
    periodo: "Matutino",
    cargaHoraria: "160 horas",
    duracao: "1 semestre",
    responsavel: "Supervisão de estágio em Administração",
    resumo: "Vivência prática em rotinas administrativas de organizações parceiras, com relatório final de atividades.",
    conteudo: ["Rotinas administrativas", "Atendimento ao cliente", "Relatório de estágio"],
    destaque: false,
  },
  {
    id: "direito-comunitario",
    nome: "Prática de Formação em Direito Comunitário",
    area: "Humanas",
    modalidade: "Extensão",
    periodo: "EAD",
    cargaHoraria: "120 horas",
    duracao: "1 semestre",
    responsavel: "Núcleo de Prática Jurídica",
    resumo: "Atividade de extensão em que os estudantes orientam a comunidade sobre direitos básicos, com apoio de professores.",
    conteudo: ["Direitos do consumidor", "Direito de família (noções)", "Acesso à justiça", "Orientação à comunidade"],
    destaque: false,
  },
  {
    id: "oficina-web",
    nome: "Oficina de Desenvolvimento Web",
    area: "Tecnologia",
    modalidade: "Extensão",
    periodo: "Noturno",
    cargaHoraria: "60 horas",
    duracao: "1 semestre",
    responsavel: "Coordenação de Extensão em Tecnologia",
    resumo: "Oficina prática de HTML, CSS e JavaScript aberta à comunidade, com construção de uma página completa ao final.",
    conteudo: ["HTML semântico", "CSS e layout responsivo", "JavaScript e DOM", "Publicação de uma página"],
    destaque: false,
  },
  {
    id: "educacao-financeira",
    nome: "Educação Financeira Comunitária",
    area: "Negócios",
    modalidade: "Extensão",
    periodo: "EAD",
    cargaHoraria: "80 horas",
    duracao: "1 semestre",
    responsavel: "Coordenação de Extensão em Negócios",
    resumo: "Projeto de extensão com encontros online sobre orçamento pessoal, consumo consciente e planejamento financeiro.",
    conteudo: ["Orçamento pessoal", "Consumo consciente", "Crédito e dívidas", "Planejamento financeiro"],
    destaque: false,
  },
];

// Avisos e prazos de exemplo. O status (Encerrado, Urgente, Em breve ou Em dia) é calculado
// pelo JavaScript a partir da data de cada aviso e do dia atual.
// Para que a demonstração sempre mostre os quatro status, a data de cada aviso de exemplo é
// "hoje + N dias". Os valores de N reproduzem as datas de 09/10 a 20/11/2026 quando hoje é
// 21/10/2026, o dia fixado nos testes automatizados. O aviso do relatório de extensão tem data fixa.
function dataEmDias(dias) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mes + "-" + dia;
}

const AVISOS = [
  { id: "av-01", data: dataEmDias(-12), titulo: "Matrícula — Administração", categoria: "Graduação", cursoId: "administracao" },
  { id: "av-02", data: dataEmDias(2), titulo: "Encerramento de inscrições — Estágio em Psicologia Clínica", categoria: "Prática de Formação", cursoId: "estagio-psicologia" },
  { id: "av-03", data: dataEmDias(7), titulo: "Matrícula — Engenharia da Computação", categoria: "Graduação", cursoId: "eng-computacao" },
  { id: "av-04", data: dataEmDias(9), titulo: "Entrega de documentos — Prática de Formação em Direito Comunitário", categoria: "Extensão", cursoId: "direito-comunitario" },
  { id: "av-05", data: dataEmDias(14), titulo: "Inscrições — Oficina de Desenvolvimento Web", categoria: "Extensão", cursoId: "oficina-web" },
  { id: "av-06", data: dataEmDias(20), titulo: "Matrícula — Sistemas de Informação", categoria: "Graduação", cursoId: "sistemas-informacao" },
  { id: "av-07", data: dataEmDias(23), titulo: "Entrega do relatório — Estágio em Administração", categoria: "Prática de Formação", cursoId: "estagio-administracao" },
  { id: "av-08", data: dataEmDias(30), titulo: "Inscrições — Educação Financeira Comunitária", categoria: "Extensão", cursoId: "educacao-financeira" },
  { id: "av-09", data: "2026-11-27", titulo: "Entrega do relatório individual de extensão", categoria: "Extensão", cursoId: "" },
];

const CATEGORIAS = ["Graduação", "Prática de Formação", "Extensão"];
