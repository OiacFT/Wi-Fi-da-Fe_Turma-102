// Wi-Fi da Fé — tela inicial: cursos em destaque e próximos prazos gerados a partir dos dados simulados.
const destaques = document.getElementById("destaques");
const proximosPrazos = document.getElementById("proximos-prazos");

if (destaques) {
  CURSOS.filter((curso) => curso.destaque).slice(0, 3).forEach((curso) => destaques.append(criarCartaoCurso(curso)));
}

if (proximosPrazos) {
  const futuros = AVISOS.filter((aviso) => diasAte(aviso.data) >= 0)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);
  futuros.forEach((aviso) => {
    const status = statusDoAviso(aviso.data);
    const cartao = criarElemento("article", "card");
    cartao.append(
      criarElemento("span", "badge " + status.classe, textoDosDias(status.dias)),
      criarElemento("h3", "", aviso.titulo),
      criarElemento("p", "text-muted", "Encerra em " + formatarData(aviso.data))
    );
    proximosPrazos.append(cartao);
  });
  if (futuros.length === 0) {
    proximosPrazos.append(criarElemento("p", "text-muted", "Nenhum prazo em aberto no momento."));
  }
}
