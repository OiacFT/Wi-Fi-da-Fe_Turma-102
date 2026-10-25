// Wi-Fi da Fé — Central de avisos e prazos.
// A tabela é montada a partir dos avisos (dados de exemplo ou os alterados no painel de responsáveis). O status de cada linha é calculado pela data, os filtros
// funcionam em tempo real e "Marcar como lido" fica salvo no localStorage.
const formularioAvisos = document.getElementById("form-avisos");
const corpoAvisos = document.getElementById("avisos-corpo");
const resumoAvisos = document.getElementById("resumo-avisos");
const avisosVazio = document.getElementById("avisos-vazio");

function criarCelula(rotulo, conteudo) {
  const celula = criarElemento("td");
  celula.dataset.rotulo = rotulo; // usado pelo CSS para empilhar a tabela em telas pequenas
  celula.append(conteudo);
  return celula;
}

function criarLinhaAviso(aviso, lido) {
  const status = statusDoAviso(aviso.data);
  const linha = criarElemento("tr", lido ? "linha--lida" : "");

  const data = criarElemento("time", "", formatarData(aviso.data));
  data.dateTime = aviso.data;

  const botao = criarElemento("button", "btn btn--ghost btn--sm", lido ? "Marcar como não lido" : "Marcar como lido");
  botao.type = "button";
  botao.setAttribute("aria-pressed", String(lido));
  botao.addEventListener("click", () => {
    alternarAvisoLido(aviso.id);
    desenharAvisos();
  });

  linha.append(
    criarCelula("Data", data),
    criarCelula("Aviso", aviso.titulo),
    criarCelula("Categoria", aviso.categoria),
    criarCelula("Status", criarElemento("span", "badge " + status.classe, status.texto)),
    criarCelula("Ação", botao)
  );
  return linha;
}

function desenharAvisos() {
  const categoria = formularioAvisos.elements.categoria.value;
  const situacao = formularioAvisos.elements.situacao.value;
  const ocultarLidos = formularioAvisos.elements["ocultar-lidos"].checked;
  const lidos = obterAvisosLidos();

  const todos = obterAvisos();
  const exibidos = todos.filter(
    (aviso) =>
      (categoria === "" || aviso.categoria === categoria) &&
      (situacao === "" || statusDoAviso(aviso.data).chave === situacao) &&
      !(ocultarLidos && lidos.includes(aviso.id))
  ).sort((a, b) => a.data.localeCompare(b.data));

  corpoAvisos.replaceChildren(...exibidos.map((aviso) => criarLinhaAviso(aviso, lidos.includes(aviso.id))));
  avisosVazio.hidden = exibidos.length > 0;

  const ativos = exibidos.filter((aviso) => statusDoAviso(aviso.data).chave !== "encerrado").length;
  document.getElementById("total-ativos").textContent = ativos;

  const urgentes = exibidos.filter((aviso) => statusDoAviso(aviso.data).chave === "urgente").length;
  resumoAvisos.textContent =
    "Mostrando " + exibidos.length + " de " + todos.length + " avisos · " + urgentes + (urgentes === 1 ? " urgente" : " urgentes");
}

formularioAvisos.addEventListener("input", desenharAvisos);
formularioAvisos.addEventListener("submit", (evento) => evento.preventDefault());
document.getElementById("btn-limpar-avisos").addEventListener("click", () => {
  formularioAvisos.reset();
  desenharAvisos();
});

desenharAvisos();
