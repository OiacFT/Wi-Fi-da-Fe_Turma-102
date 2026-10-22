// Wi-Fi da Fé — detalhes do curso. O curso exibido vem do parâmetro ?id= da URL e dos dados simulados.
const parametros = new URLSearchParams(window.location.search);
const cursoAtual = CURSOS.find((curso) => curso.id === parametros.get("id"));
const conteudoCurso = document.getElementById("conteudo-curso");
const cursoNaoEncontrado = document.getElementById("curso-nao-encontrado");

function desenharDetalhes(curso) {
  document.title = curso.nome + " | Wi-Fi da Fé";
  document.getElementById("curso-area").textContent = curso.area;
  document.getElementById("curso-modalidade").textContent = curso.modalidade;
  document.getElementById("curso-titulo").textContent = curso.nome;
  document.getElementById("curso-resumo").textContent = curso.resumo;
  document.getElementById("info-carga").textContent = curso.cargaHoraria;
  document.getElementById("info-periodo").textContent = curso.periodo;
  document.getElementById("info-duracao").textContent = curso.duracao;
  document.getElementById("info-responsavel").textContent = curso.responsavel;
  document.getElementById("curso-conteudo").replaceChildren(...curso.conteudo.map((item) => criarElemento("li", "", item)));

  // Prazos ligados a este curso (filtrados em AVISOS pelo cursoId)
  const prazos = AVISOS.filter((aviso) => aviso.cursoId === curso.id);
  const listaPrazos = document.getElementById("curso-prazos");
  if (prazos.length === 0) {
    listaPrazos.append(criarElemento("li", "text-muted", "Nenhum prazo cadastrado para este curso."));
  }
  prazos.forEach((aviso) => {
    const status = statusDoAviso(aviso.data);
    const item = criarElemento("li", "");
    item.append(
      criarElemento("span", "badge " + status.classe, status.texto),
      " " + aviso.titulo + " (" + formatarData(aviso.data) + ")"
    );
    listaPrazos.append(item);
  });
}

// Botão Salvar interesse / Remover dos salvos: só funciona com o usuário logado.
function configurarSalvar(curso) {
  const botao = document.getElementById("btn-salvar-interesse");
  const mensagem = document.getElementById("msg-salvar");
  const usuario = obterUsuarioLogado();

  function atualizarBotao() {
    const salvo = cursoEstaSalvo(curso.id);
    botao.textContent = salvo ? "Remover dos salvos" : "Salvar interesse";
    botao.classList.toggle("btn--primary", !salvo);
    botao.classList.toggle("btn--ghost", salvo);
    botao.setAttribute("aria-pressed", String(salvo));
  }

  atualizarBotao();
  if (!usuario) {
    mostrarMensagem(mensagem, "info", "Entre na sua conta para salvar este curso no perfil.");
    const link = criarElemento("a", "", "Ir para o login");
    link.href = "login.html";
    mensagem.append(" ", link);
  }

  botao.addEventListener("click", () => {
    if (!obterUsuarioLogado()) {
      window.location.href = "login.html";
      return;
    }
    if (cursoEstaSalvo(curso.id)) {
      removerCurso(curso.id);
      mostrarMensagem(mensagem, "info", "Curso removido do seu perfil.");
    } else {
      salvarCurso(curso);
      mostrarMensagem(mensagem, "sucesso", "Curso salvo! Veja a lista completa em Perfil.");
    }
    atualizarBotao();
  });
}

if (cursoAtual) {
  desenharDetalhes(cursoAtual);
  configurarSalvar(cursoAtual);
} else {
  conteudoCurso.hidden = true;
  cursoNaoEncontrado.hidden = false;
  document.title = "Curso não encontrado | Wi-Fi da Fé";
}
