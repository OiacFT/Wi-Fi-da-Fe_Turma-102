// Wi-Fi da Fé — comportamento comum a todas as páginas (3ª Entrega)
// Menu mobile, área do usuário na barra superior, funções auxiliares de DOM e de datas e FAQ (acordeão).

// ----- Funções auxiliares -----
// Cria um elemento com classe e texto (textContent evita interpretar HTML digitado pelo usuário).
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

// "2026-10-23" -> Date no fuso local (new Date("2026-10-23") seria interpretado em UTC).
function dataDoISO(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarData(iso) {
  return dataDoISO(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Diferença em dias entre a data do aviso e hoje (negativa quando já passou).
function diasAte(iso) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((dataDoISO(iso) - hoje) / 86400000);
}

// Define o status de um aviso conforme a proximidade do prazo.
function statusDoAviso(iso) {
  const dias = diasAte(iso);
  if (dias < 0) return { chave: "encerrado", texto: "Encerrado", classe: "badge--neutro", dias: dias };
  if (dias <= 3) return { chave: "urgente", texto: "Urgente", classe: "badge--danger", dias: dias };
  if (dias <= 14) return { chave: "breve", texto: "Em breve", classe: "badge--accent", dias: dias };
  return { chave: "emdia", texto: "Em dia", classe: "badge--success", dias: dias };
}

function textoDosDias(dias) {
  if (dias < 0) return "Encerrado";
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  return "Vence em " + dias + " dias";
}

// Cria o cartão de um curso (usado na tela inicial e na lista de cursos).
function criarCartaoCurso(curso) {
  const cartao = criarElemento("article", "card card--curso");
  const etiquetas = criarElemento("div", "badge-row");
  etiquetas.append(criarElemento("span", "badge", curso.area), criarElemento("span", "badge badge--accent", curso.modalidade));
  const detalhes = criarElemento("a", "btn btn--ghost btn--sm", "Ver detalhes");
  detalhes.href = "curso-detalhe.html?id=" + encodeURIComponent(curso.id);
  detalhes.setAttribute("aria-label", "Ver detalhes de " + curso.nome);
  cartao.append(
    etiquetas,
    criarElemento("h3", "", curso.nome),
    criarElemento("p", "text-muted", "Carga horária: " + curso.cargaHoraria.replace(" horas", "h") + " · Período: " + curso.periodo),
    detalhes
  );
  return cartao;
}

// ----- Menu mobile -----
const botaoMenu = document.getElementById("menu-toggle");
const listaMenu = document.getElementById("navbar-menu");

function definirMenuAberto(aberto) {
  listaMenu.classList.toggle("navbar__menu--aberto", aberto);
  botaoMenu.setAttribute("aria-expanded", String(aberto));
}

if (botaoMenu && listaMenu) {
  botaoMenu.addEventListener("click", () => definirMenuAberto(!listaMenu.classList.contains("navbar__menu--aberto")));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && listaMenu.classList.contains("navbar__menu--aberto")) {
      definirMenuAberto(false);
      botaoMenu.focus();
    }
  });
}

// Contas de responsáveis ganham o item "Painel" no menu (atualização de cursos e prazos).
function ehResponsavel(usuario) {
  return Boolean(usuario) && usuario.tipo === "responsavel";
}

function adicionarItemPainel() {
  if (!listaMenu || listaMenu.querySelector('a[href="painel.html"]')) return;
  const item = criarElemento("li");
  const link = criarElemento("a", "", "Painel");
  link.href = "painel.html";
  if (window.location.pathname.endsWith("painel.html")) link.setAttribute("aria-current", "page");
  item.append(link);
  listaMenu.append(item);
}

// ----- Área do usuário na barra superior (Entrar/Criar conta -> Olá, Nome + Sair) -----
function atualizarNavbarUsuario() {
  const usuario = obterUsuarioLogado();
  const acoes = document.querySelector(".navbar__actions");
  if (!usuario || !acoes) return;
  if (ehResponsavel(usuario)) adicionarItemPainel();
  const perfil = criarElemento("a", "btn btn--ghost btn--sm", "Olá, " + usuario.nome.split(" ")[0]);
  perfil.href = "perfil.html";
  const sair = criarElemento("button", "btn btn--primary btn--sm", "Sair");
  sair.type = "button";
  sair.addEventListener("click", () => {
    encerrarSessao();
    window.location.href = "login.html?saiu=1";
  });
  acoes.replaceChildren(perfil, sair);
}

// ----- FAQ em acordeão (Sobre): botão com aria-expanded mostra/oculta a resposta -----
function ativarAcordeao() {
  document.querySelectorAll(".acordeao__botao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const resposta = document.getElementById(botao.getAttribute("aria-controls"));
      const abrir = botao.getAttribute("aria-expanded") !== "true";
      botao.setAttribute("aria-expanded", String(abrir));
      resposta.hidden = !abrir;
    });
  });
}

atualizarNavbarUsuario();
ativarAcordeao();
