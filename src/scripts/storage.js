// Wi-Fi da Fé — persistência local (sem back-end/banco de dados)
// Conta, cursos salvos, mensagens e avisos lidos ficam no localStorage (permanecem após fechar o navegador).
// A sessão de login fica no sessionStorage (some ao fechar a aba) ou no localStorage, se o usuário
// marcar "Manter conectado". A senha NÃO é armazenada em nenhum lugar.
const WIFIDAFE_KEYS = {
  usuario: "wifidafe_usuario",
  cursosSalvos: "wifidafe_cursos_salvos",
  mensagensContato: "wifidafe_mensagens_contato",
  avisosLidos: "wifidafe_avisos_lidos",
  sessao: "wifidafe_sessao",
  filtrosCursos: "wifidafe_filtros_cursos",
  cursos: "wifidafe_cursos",
  avisos: "wifidafe_avisos",
};

// Lê e converte um JSON do storage; se estiver ausente ou corrompido, devolve o valor padrão.
function lerJSON(storage, chave, padrao) {
  try {
    const bruto = storage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    return padrao;
  }
}

// ----- Conta do usuário (cadastro) -----
function salvarUsuario(dados) {
  localStorage.setItem(WIFIDAFE_KEYS.usuario, JSON.stringify(dados));
}

function obterUsuario() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.usuario, null);
}

function removerUsuario() {
  localStorage.removeItem(WIFIDAFE_KEYS.usuario);
}

// ----- Sessão (login/logout) -----
function iniciarSessao(email, manterConectado) {
  const sessao = JSON.stringify({ email: email, inicio: new Date().toISOString() });
  encerrarSessao();
  (manterConectado ? localStorage : sessionStorage).setItem(WIFIDAFE_KEYS.sessao, sessao);
}

function obterSessao() {
  return lerJSON(sessionStorage, WIFIDAFE_KEYS.sessao, null) || lerJSON(localStorage, WIFIDAFE_KEYS.sessao, null);
}

function encerrarSessao() {
  sessionStorage.removeItem(WIFIDAFE_KEYS.sessao);
  localStorage.removeItem(WIFIDAFE_KEYS.sessao);
}

// Devolve a conta do usuário somente se houver uma sessão ativa para ela; caso contrário, null.
function obterUsuarioLogado() {
  const sessao = obterSessao();
  const usuario = obterUsuario();
  if (sessao && usuario && sessao.email === usuario.email) {
    return usuario;
  }
  return null;
}

// ----- Cursos salvos (cada item: id, nome, categoria, status, salvoEm) -----
function obterCursosSalvos() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.cursosSalvos, []);
}

function gravarCursosSalvos(cursos) {
  localStorage.setItem(WIFIDAFE_KEYS.cursosSalvos, JSON.stringify(cursos));
}

function cursoEstaSalvo(id) {
  return obterCursosSalvos().some((c) => c.id === id);
}

function salvarCurso(curso) {
  const cursos = obterCursosSalvos();
  if (!cursos.some((c) => c.id === curso.id)) {
    cursos.push({ id: curso.id, nome: curso.nome, categoria: curso.modalidade, status: "Interesse", salvoEm: new Date().toISOString() });
    gravarCursosSalvos(cursos);
  }
  return cursos;
}

function removerCurso(id) {
  const cursos = obterCursosSalvos().filter((c) => c.id !== id);
  gravarCursosSalvos(cursos);
  return cursos;
}

function atualizarStatusCurso(id, status) {
  const cursos = obterCursosSalvos().map((c) => (c.id === id ? { ...c, status: status } : c));
  gravarCursosSalvos(cursos);
  return cursos;
}

// ----- Cursos e avisos (dados.js traz os exemplos; o painel de responsáveis grava as alterações) -----
// Enquanto ninguém alterar nada pelo painel, as telas usam os dados de exemplo de dados.js.
function copiaProfunda(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function obterCursos() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.cursos, null) || copiaProfunda(CURSOS);
}

function gravarCursos(lista) {
  localStorage.setItem(WIFIDAFE_KEYS.cursos, JSON.stringify(lista));
}

function obterAvisos() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.avisos, null) || copiaProfunda(AVISOS);
}

function gravarAvisos(lista) {
  localStorage.setItem(WIFIDAFE_KEYS.avisos, JSON.stringify(lista));
}

// Volta cursos e avisos para os dados de exemplo (apaga só o que o painel gravou).
function restaurarDadosExemplo() {
  localStorage.removeItem(WIFIDAFE_KEYS.cursos);
  localStorage.removeItem(WIFIDAFE_KEYS.avisos);
}

// ----- Mensagens do formulário de contato -----
function obterMensagensContato() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.mensagensContato, []);
}

function salvarMensagemContato(mensagem) {
  const mensagens = obterMensagensContato();
  mensagens.push({ ...mensagem, data: new Date().toISOString() });
  localStorage.setItem(WIFIDAFE_KEYS.mensagensContato, JSON.stringify(mensagens));
  return mensagens.length;
}

// ----- Avisos marcados como lidos -----
function obterAvisosLidos() {
  return lerJSON(localStorage, WIFIDAFE_KEYS.avisosLidos, []);
}

function alternarAvisoLido(id) {
  const lidos = obterAvisosLidos();
  const novos = lidos.includes(id) ? lidos.filter((x) => x !== id) : [...lidos, id];
  localStorage.setItem(WIFIDAFE_KEYS.avisosLidos, JSON.stringify(novos));
  return novos;
}

// ----- Remove tudo que o Wi-Fi da Fé gravou neste navegador -----
function limparDadosLocais() {
  Object.values(WIFIDAFE_KEYS).forEach((chave) => {
    localStorage.removeItem(chave);
    sessionStorage.removeItem(chave);
  });
}
