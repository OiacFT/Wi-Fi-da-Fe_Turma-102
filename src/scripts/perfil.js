// Wi-Fi da Fé — perfil do usuário (área restrita simulada).
// O conteúdo fica oculto até o JavaScript confirmar que há uma sessão ativa. Isso é uma simulação
// didática: como não existe servidor, qualquer pessoa pode alterar o storage pelo DevTools.
const areaRestrita = document.getElementById("perfil-restrito");
const areaPerfil = document.getElementById("perfil-conteudo");
const STATUS_CURSO = ["Interesse", "Inscrição pendente", "Matriculado"];

const usuarioAtual = obterUsuarioLogado();

function desenharDadosDoUsuario(usuario) {
  document.getElementById("perfil-nome").textContent = usuario.nome;
  document.getElementById("perfil-email").textContent = usuario.email;
  document.getElementById("perfil-curso").textContent = usuario.curso || "Não informado";
  document.getElementById("perfil-tipo").textContent = ehResponsavel(usuario) ? "Responsável por cursos e prazos" : "Estudante";
  document.getElementById("link-painel").hidden = !ehResponsavel(usuario);
  document.getElementById("perfil-desde").textContent = usuario.criadoEm ? new Date(usuario.criadoEm).toLocaleDateString("pt-BR") : "—";
}

function criarSeletorStatus(curso) {
  const seletor = criarElemento("select", "select-status");
  seletor.setAttribute("aria-label", "Status de " + curso.nome);
  STATUS_CURSO.forEach((opcao) => {
    const item = criarElemento("option", "", opcao);
    item.selected = opcao === curso.status;
    seletor.append(item);
  });
  seletor.addEventListener("change", () => {
    atualizarStatusCurso(curso.id, seletor.value);
    desenharCursosSalvos();
  });
  return seletor;
}

function desenharCursosSalvos() {
  const corpo = document.getElementById("cursos-salvos-body");
  const resumo = document.getElementById("resumo-salvos");
  const cursos = obterCursosSalvos();
  corpo.replaceChildren();
  resumo.textContent = cursos.length === 1 ? "1 item salvo" : cursos.length + " itens salvos";

  if (cursos.length === 0) {
    const linha = criarElemento("tr");
    const celula = criarElemento("td", "", "Nenhum curso salvo ainda. Abra a lista de ");
    celula.colSpan = 4;
    const link = criarElemento("a", "", "Cursos");
    link.href = "cursos.html";
    celula.append(link, ' e use "Salvar interesse" na página de detalhes.');
    linha.append(celula);
    corpo.append(linha);
    return;
  }

  cursos.forEach((curso) => {
    const nome = criarElemento("a", "", curso.nome);
    nome.href = "curso-detalhe.html?id=" + encodeURIComponent(curso.id);
    const remover = criarElemento("button", "btn btn--ghost btn--sm", "Remover");
    remover.type = "button";
    remover.setAttribute("aria-label", "Remover " + curso.nome + " dos salvos");
    remover.addEventListener("click", () => {
      removerCurso(curso.id);
      desenharCursosSalvos();
    });
    const linha = criarElemento("tr");
    [["Nome", nome], ["Categoria", curso.categoria], ["Status", criarSeletorStatus(curso)], ["Ação", remover]].forEach(([rotulo, conteudo]) => {
      const celula = criarElemento("td");
      celula.dataset.rotulo = rotulo;
      celula.append(conteudo);
      linha.append(celula);
    });
    corpo.append(linha);
  });
}

function configurarEdicao(usuario) {
  const formulario = document.getElementById("form-perfil");
  const botaoEditar = document.getElementById("btn-editar");
  const mensagem = document.getElementById("mensagem-perfil");
  ativarValidacaoEmTempoReal(formulario);

  botaoEditar.addEventListener("click", () => {
    const abrir = formulario.hidden;
    formulario.hidden = !abrir;
    botaoEditar.setAttribute("aria-expanded", String(abrir));
    botaoEditar.textContent = abrir ? "Cancelar edição" : "Editar dados";
    if (abrir) {
      formulario.elements.nome.value = usuario.nome;
      formulario.elements["curso-interesse"].value = usuario.curso || "";
      formulario.elements.nome.focus();
    }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(formulario)) return;
    usuario.nome = formulario.elements.nome.value.trim().replace(/\s+/g, " ");
    usuario.curso = formulario.elements["curso-interesse"].value;
    salvarUsuario(usuario);
    desenharDadosDoUsuario(usuario);
    formulario.hidden = true;
    botaoEditar.setAttribute("aria-expanded", "false");
    botaoEditar.textContent = "Editar dados";
    mostrarMensagem(mensagem, "sucesso", "Dados atualizados neste navegador.");
    atualizarNavbarUsuario();
  });
}

if (usuarioAtual) {
  areaRestrita.hidden = true;
  areaPerfil.hidden = false;
  desenharDadosDoUsuario(usuarioAtual);
  desenharCursosSalvos();
  configurarEdicao(usuarioAtual);

  document.getElementById("btn-sair").addEventListener("click", () => {
    encerrarSessao();
    window.location.href = "login.html?saiu=1";
  });
  document.getElementById("btn-excluir").addEventListener("click", () => {
    if (window.confirm("Isso apaga sua conta, os cursos salvos e as mensagens deste navegador. Deseja continuar?")) {
      limparDadosLocais();
      window.location.href = "index.html";
    }
  });
} else {
  areaRestrita.hidden = false;
  areaPerfil.hidden = true;
}
