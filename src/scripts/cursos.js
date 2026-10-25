// Wi-Fi da Fé — lista de cursos com busca e filtros em tempo real.
// Os cartões são criados pelo JavaScript a partir da lista de cursos (dados.js ou o que foi alterado no painel de responsáveis). Os filtros escolhidos ficam no
// sessionStorage, então voltar de "Ver detalhes" mantém a busca feita.
const formularioFiltros = document.getElementById("form-filtros");
const listaCursos = document.getElementById("lista-cursos");
const contagemCursos = document.getElementById("contagem-cursos");
const semResultados = document.getElementById("sem-resultados");

// Remove acentos e maiúsculas para a busca por nome ("psicologia" encontra "Psicologia").
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function lerFiltros() {
  return {
    busca: formularioFiltros.elements.busca.value,
    area: formularioFiltros.elements.area.value,
    modalidade: formularioFiltros.elements.modalidade.value,
    periodo: formularioFiltros.elements.periodo.value,
  };
}

function filtrarCursos(filtros) {
  const termo = normalizar(filtros.busca.trim());
  return obterCursos().filter(
    (curso) =>
      normalizar(curso.nome).includes(termo) &&
      (filtros.area === "" || curso.area === filtros.area) &&
      (filtros.modalidade === "" || curso.modalidade === filtros.modalidade) &&
      (filtros.periodo === "" || curso.periodo === filtros.periodo)
  );
}

function desenharCursos() {
  const filtros = lerFiltros();
  sessionStorage.setItem(WIFIDAFE_KEYS.filtrosCursos, JSON.stringify(filtros));
  const encontrados = filtrarCursos(filtros);
  listaCursos.replaceChildren(...encontrados.map(criarCartaoCurso));
  semResultados.hidden = encontrados.length > 0;
  contagemCursos.textContent =
    encontrados.length === 1 ? "1 curso encontrado" : encontrados.length + " cursos encontrados";
}

function restaurarFiltros() {
  const salvos = lerJSON(sessionStorage, WIFIDAFE_KEYS.filtrosCursos, null);
  if (!salvos) return;
  Object.keys(salvos).forEach((nome) => {
    if (formularioFiltros.elements[nome]) formularioFiltros.elements[nome].value = salvos[nome];
  });
}

formularioFiltros.addEventListener("input", desenharCursos);
formularioFiltros.addEventListener("submit", (evento) => evento.preventDefault());
document.getElementById("btn-limpar").addEventListener("click", () => {
  formularioFiltros.reset();
  desenharCursos();
  formularioFiltros.elements.busca.focus();
});

restaurarFiltros();
desenharCursos();
