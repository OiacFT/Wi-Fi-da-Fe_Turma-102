// Wi-Fi da Fé — persistência local (sem back-end/banco de dados)
// Todas as informações do usuário ficam salvas apenas neste navegador (localStorage).
const WIFIDAFE_KEYS = {
  usuario: "wifidafe_usuario",
  cursosSalvos: "wifidafe_cursos_salvos",
  mensagensContato: "wifidafe_mensagens_contato",
};

function salvarUsuario(dados) {
  localStorage.setItem(WIFIDAFE_KEYS.usuario, JSON.stringify(dados));
}

function obterUsuario() {
  const bruto = localStorage.getItem(WIFIDAFE_KEYS.usuario);
  return bruto ? JSON.parse(bruto) : null;
}

function removerUsuario() {
  localStorage.removeItem(WIFIDAFE_KEYS.usuario);
}

function obterCursosSalvos() {
  const bruto = localStorage.getItem(WIFIDAFE_KEYS.cursosSalvos);
  return bruto ? JSON.parse(bruto) : [];
}

function salvarCurso(curso) {
  const cursos = obterCursosSalvos();
  if (!cursos.some((c) => c.nome === curso.nome)) {
    cursos.push(curso);
    localStorage.setItem(WIFIDAFE_KEYS.cursosSalvos, JSON.stringify(cursos));
  }
  return cursos;
}

function removerCurso(nome) {
  const cursos = obterCursosSalvos().filter((c) => c.nome !== nome);
  localStorage.setItem(WIFIDAFE_KEYS.cursosSalvos, JSON.stringify(cursos));
  return cursos;
}

function salvarMensagemContato(mensagem) {
  const mensagens = JSON.parse(localStorage.getItem(WIFIDAFE_KEYS.mensagensContato) || "[]");
  mensagens.push({ ...mensagem, data: new Date().toISOString() });
  localStorage.setItem(WIFIDAFE_KEYS.mensagensContato, JSON.stringify(mensagens));
}

// Atualiza a navbar (Entrar/Criar conta -> nome do usuário) quando há sessão local salva.
function atualizarNavbarUsuario() {
  const usuario = obterUsuario();
  const acoes = document.querySelector(".navbar__actions");
  const temBotaoCadastro = acoes && acoes.querySelector('a[href*="cadastro.html"]');
  if (usuario && acoes && temBotaoCadastro && !acoes.dataset.logado) {
    acoes.dataset.logado = "true";
    acoes.innerHTML = `<a class="btn btn--ghost btn--sm" href="${
      location.pathname.includes("/src/pages/") ? "perfil.html" : "src/pages/perfil.html"
    }">Olá, ${usuario.nome.split(" ")[0]}</a>`;
  }
}

document.addEventListener("DOMContentLoaded", atualizarNavbarUsuario);
