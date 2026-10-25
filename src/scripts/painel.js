// Wi-Fi da Fé — painel de atualização de informações para responsáveis.
// Só contas do tipo "responsável" entram. As alterações (adicionar, editar e excluir cursos e avisos)
// ficam no localStorage e passam a valer nas telas Início, Cursos, Detalhes e Avisos.
// Como não há servidor, o tipo de conta é escolhido no cadastro e não é verificado por um back-end.
const painelRestrito = document.getElementById("painel-restrito");
const painelConteudo = document.getElementById("painel-conteudo");
const mensagemPainel = document.getElementById("mensagem-painel");
const formCurso = document.getElementById("form-curso");
const formAviso = document.getElementById("form-aviso");
const usuarioPainel = obterUsuarioLogado();

let cursoEmEdicao = null; // id do curso que está sendo editado (null = adicionando)
let avisoEmEdicao = null;

function gerarId(prefixo, texto) {
  const base = texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return prefixo + "-" + base.slice(0, 30) + "-" + Date.now().toString(36);
}

function celulaDe(rotulo, conteudo) {
  const celula = criarElemento("td");
  celula.dataset.rotulo = rotulo;
  celula.append(conteudo);
  return celula;
}

function botaoAcao(texto, nomeAcessivel, classe, aoClicar) {
  const botao = criarElemento("button", "btn btn--sm " + classe, texto);
  botao.type = "button";
  botao.setAttribute("aria-label", nomeAcessivel);
  botao.addEventListener("click", aoClicar);
  return botao;
}

function avisarPainel(tipo, texto) {
  mostrarMensagem(mensagemPainel, tipo, texto);
}

// ----- Cursos -----
function desenharCursos() {
  const cursos = obterCursos().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  document.getElementById("painel-cursos-corpo").replaceChildren(
    ...cursos.map((curso) => {
      const acoes = criarElemento("div", "acoes-linha");
      acoes.append(
        botaoAcao("Editar", "Editar " + curso.nome, "btn--ghost", () => editarCurso(curso.id)),
        botaoAcao("Excluir", "Excluir " + curso.nome, "btn--perigo", () => excluirCurso(curso.id))
      );
      const linha = criarElemento("tr");
      linha.append(
        celulaDe("Nome", curso.nome),
        celulaDe("Área", curso.area),
        celulaDe("Modalidade", curso.modalidade),
        celulaDe("Período", curso.periodo),
        celulaDe("Ações", acoes)
      );
      return linha;
    })
  );
  document.getElementById("resumo-cursos").textContent = cursos.length === 1 ? "1 curso cadastrado" : cursos.length + " cursos cadastrados";
  preencherSeletorCursos();
}

function preencherSeletorCursos() {
  const seletor = formAviso.elements["aviso-curso"];
  const atual = seletor.value;
  const opcoes = [criarElemento("option", "", "Nenhum (aviso geral)")];
  opcoes[0].value = "";
  obterCursos().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).forEach((curso) => {
    const opcao = criarElemento("option", "", curso.nome);
    opcao.value = curso.id;
    opcoes.push(opcao);
  });
  seletor.replaceChildren(...opcoes);
  seletor.value = [...seletor.options].some((o) => o.value === atual) ? atual : "";
}

function limparFormulario(formulario) {
  formulario.reset();
  formulario.querySelectorAll(".campo--ok, .campo--erro").forEach((campo) => campo.classList.remove("campo--ok", "campo--erro"));
  formulario.querySelectorAll(".erro-campo").forEach((aviso) => (aviso.textContent = ""));
  formulario.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
}

function sairDaEdicaoDeCurso() {
  cursoEmEdicao = null;
  limparFormulario(formCurso);
  document.getElementById("titulo-form-curso").textContent = "Adicionar curso ou prática";
  document.getElementById("btn-salvar-curso").textContent = "Adicionar curso";
  document.getElementById("btn-cancelar-curso").hidden = true;
}

function editarCurso(id) {
  const curso = obterCursos().find((c) => c.id === id);
  if (!curso) return;
  cursoEmEdicao = id;
  const f = formCurso.elements;
  f["curso-nome"].value = curso.nome;
  f["curso-area"].value = curso.area;
  f["curso-modalidade"].value = curso.modalidade;
  f["curso-periodo"].value = curso.periodo;
  f["curso-carga"].value = curso.cargaHoraria;
  f["curso-duracao"].value = curso.duracao;
  f["curso-responsavel"].value = curso.responsavel;
  f["curso-resumo"].value = curso.resumo;
  f["curso-conteudo"].value = curso.conteudo.join("\n");
  f["curso-destaque"].checked = Boolean(curso.destaque);
  document.getElementById("titulo-form-curso").textContent = "Editar curso: " + curso.nome;
  document.getElementById("btn-salvar-curso").textContent = "Salvar alterações";
  document.getElementById("btn-cancelar-curso").hidden = false;
  f["curso-nome"].focus();
}

function excluirCurso(id) {
  const curso = obterCursos().find((c) => c.id === id);
  if (!curso || !window.confirm('Excluir "' + curso.nome + '"? Os avisos ligados a ele passam a ser avisos gerais.')) return;
  gravarCursos(obterCursos().filter((c) => c.id !== id));
  gravarAvisos(obterAvisos().map((a) => (a.cursoId === id ? { ...a, cursoId: "" } : a)));
  removerCurso(id); // tira também da lista de salvos do perfil
  if (cursoEmEdicao === id) sairDaEdicaoDeCurso();
  desenharCursos();
  desenharAvisosPainel();
  avisarPainel("info", 'Curso "' + curso.nome + '" excluído.');
}

formCurso.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(formCurso)) {
    avisarPainel("erro", "Corrija os campos destacados no formulário de curso.");
    return;
  }
  const f = formCurso.elements;
  const dados = {
    nome: f["curso-nome"].value.trim(),
    area: f["curso-area"].value,
    modalidade: f["curso-modalidade"].value,
    periodo: f["curso-periodo"].value,
    cargaHoraria: f["curso-carga"].value.trim(),
    duracao: f["curso-duracao"].value.trim(),
    responsavel: f["curso-responsavel"].value.trim(),
    resumo: f["curso-resumo"].value.trim(),
    conteudo: f["curso-conteudo"].value.split("\n").map((linha) => linha.trim()).filter((linha) => linha !== ""),
    destaque: f["curso-destaque"].checked,
  };
  const cursos = obterCursos();
  if (cursoEmEdicao) {
    gravarCursos(cursos.map((c) => (c.id === cursoEmEdicao ? { ...c, ...dados } : c)));
    avisarPainel("sucesso", 'Curso "' + dados.nome + '" atualizado.');
  } else {
    gravarCursos([...cursos, { id: gerarId("curso", dados.nome), ...dados }]);
    avisarPainel("sucesso", 'Curso "' + dados.nome + '" adicionado. Ele já aparece em Cursos.');
  }
  sairDaEdicaoDeCurso();
  desenharCursos();
});
document.getElementById("btn-cancelar-curso").addEventListener("click", sairDaEdicaoDeCurso);
ativarValidacaoEmTempoReal(formCurso);

// ----- Avisos -----
function nomeDoCurso(id) {
  const curso = obterCursos().find((c) => c.id === id);
  return curso ? curso.nome : "Aviso geral";
}

function desenharAvisosPainel() {
  const avisos = obterAvisos().sort((a, b) => a.data.localeCompare(b.data));
  document.getElementById("painel-avisos-corpo").replaceChildren(
    ...avisos.map((aviso) => {
      const status = statusDoAviso(aviso.data);
      const acoes = criarElemento("div", "acoes-linha");
      acoes.append(
        botaoAcao("Editar", "Editar o aviso " + aviso.titulo, "btn--ghost", () => editarAviso(aviso.id)),
        botaoAcao("Excluir", "Excluir o aviso " + aviso.titulo, "btn--perigo", () => excluirAviso(aviso.id))
      );
      const linha = criarElemento("tr");
      linha.append(
        celulaDe("Data", formatarData(aviso.data)),
        celulaDe("Aviso", aviso.titulo),
        celulaDe("Categoria", aviso.categoria),
        celulaDe("Curso", nomeDoCurso(aviso.cursoId)),
        celulaDe("Status", criarElemento("span", "badge " + status.classe, status.texto)),
        celulaDe("Ações", acoes)
      );
      return linha;
    })
  );
  document.getElementById("resumo-avisos-painel").textContent = avisos.length === 1 ? "1 aviso cadastrado" : avisos.length + " avisos cadastrados";
}

function sairDaEdicaoDeAviso() {
  avisoEmEdicao = null;
  limparFormulario(formAviso);
  document.getElementById("titulo-form-aviso").textContent = "Adicionar aviso ou prazo";
  document.getElementById("btn-salvar-aviso").textContent = "Adicionar aviso";
  document.getElementById("btn-cancelar-aviso").hidden = true;
}

function editarAviso(id) {
  const aviso = obterAvisos().find((a) => a.id === id);
  if (!aviso) return;
  avisoEmEdicao = id;
  const f = formAviso.elements;
  f["aviso-titulo"].value = aviso.titulo;
  f["aviso-data"].value = aviso.data;
  f["aviso-categoria"].value = aviso.categoria;
  f["aviso-curso"].value = aviso.cursoId;
  document.getElementById("titulo-form-aviso").textContent = "Editar aviso";
  document.getElementById("btn-salvar-aviso").textContent = "Salvar alterações";
  document.getElementById("btn-cancelar-aviso").hidden = false;
  f["aviso-titulo"].focus();
}

function excluirAviso(id) {
  const aviso = obterAvisos().find((a) => a.id === id);
  if (!aviso || !window.confirm('Excluir o aviso "' + aviso.titulo + '"?')) return;
  gravarAvisos(obterAvisos().filter((a) => a.id !== id));
  if (avisoEmEdicao === id) sairDaEdicaoDeAviso();
  desenharAvisosPainel();
  avisarPainel("info", "Aviso excluído.");
}

formAviso.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(formAviso)) {
    avisarPainel("erro", "Corrija os campos destacados no formulário de aviso.");
    return;
  }
  const f = formAviso.elements;
  const dados = {
    titulo: f["aviso-titulo"].value.trim(),
    data: f["aviso-data"].value,
    categoria: f["aviso-categoria"].value,
    cursoId: f["aviso-curso"].value,
  };
  const avisos = obterAvisos();
  if (avisoEmEdicao) {
    gravarAvisos(avisos.map((a) => (a.id === avisoEmEdicao ? { ...a, ...dados } : a)));
    avisarPainel("sucesso", "Aviso atualizado.");
  } else {
    gravarAvisos([...avisos, { id: gerarId("aviso", dados.titulo), ...dados }]);
    avisarPainel("sucesso", "Aviso adicionado. Ele já aparece em Avisos e, se estiver próximo, na tela inicial.");
  }
  sairDaEdicaoDeAviso();
  desenharAvisosPainel();
});
document.getElementById("btn-cancelar-aviso").addEventListener("click", sairDaEdicaoDeAviso);
ativarValidacaoEmTempoReal(formAviso);

// ----- Restaurar dados de exemplo -----
document.getElementById("btn-restaurar").addEventListener("click", () => {
  if (!window.confirm("Isso descarta as alterações feitas no painel e volta para os cursos e avisos de exemplo. Deseja continuar?")) return;
  restaurarDadosExemplo();
  sairDaEdicaoDeCurso();
  sairDaEdicaoDeAviso();
  desenharCursos();
  desenharAvisosPainel();
  avisarPainel("info", "Dados de exemplo restaurados.");
});

// ----- Acesso restrito -----
if (ehResponsavel(usuarioPainel)) {
  painelRestrito.hidden = true;
  painelConteudo.hidden = false;
  desenharCursos();
  desenharAvisosPainel();
} else {
  painelRestrito.hidden = false;
  painelConteudo.hidden = true;
  document.getElementById("painel-motivo").textContent = usuarioPainel
    ? "O painel é exclusivo para contas de responsáveis por cursos e prazos. Sua conta é de estudante."
    : "Entre com uma conta de responsável para atualizar cursos e prazos.";
  document.getElementById("painel-link-login").hidden = Boolean(usuarioPainel);
}
