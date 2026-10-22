// Wi-Fi da Fé — formulário de contato: validação, contador de caracteres e registro local da mensagem.
const formularioContato = document.getElementById("form-contato");
const mensagemContato = document.getElementById("mensagem-contato");
const campoTexto = formularioContato.elements.mensagem;
const contadorTexto = document.getElementById("contador-mensagem");
const totalEnviadas = document.getElementById("total-enviadas");
const LIMITE_MENSAGEM = Number(campoTexto.getAttribute("maxlength"));

ativarValidacaoEmTempoReal(formularioContato);

function atualizarContador() {
  const restantes = LIMITE_MENSAGEM - campoTexto.value.length;
  contadorTexto.textContent = campoTexto.value.length + "/" + LIMITE_MENSAGEM + " caracteres";
  contadorTexto.classList.toggle("contador--alerta", restantes <= 50);
}

function atualizarTotal() {
  const total = obterMensagensContato().length;
  totalEnviadas.textContent = total === 0 ? "Nenhuma mensagem registrada neste navegador." : "Mensagens registradas neste navegador: " + total + ".";
}

// Com o usuário logado, nome e e-mail já vêm preenchidos.
const usuarioContato = obterUsuarioLogado();
if (usuarioContato) {
  formularioContato.elements.nome.value = usuarioContato.nome;
  formularioContato.elements.email.value = usuarioContato.email;
}

campoTexto.addEventListener("input", atualizarContador);

formularioContato.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(formularioContato)) {
    mostrarMensagem(mensagemContato, "erro", "Corrija os campos destacados antes de enviar.");
    return;
  }
  const numero = salvarMensagemContato({
    nome: formularioContato.elements.nome.value.trim(),
    email: formularioContato.elements.email.value.trim(),
    assunto: formularioContato.elements.assunto.value,
    mensagem: campoTexto.value.trim(),
  });
  mostrarMensagem(mensagemContato, "sucesso", "Mensagem registrada com sucesso (nº " + numero + "). Obrigado pelo contato!");
  campoTexto.value = "";
  formularioContato.elements.assunto.selectedIndex = 0;
  formularioContato.querySelectorAll(".campo--ok, .campo--erro").forEach((campo) => campo.classList.remove("campo--ok", "campo--erro"));
  atualizarContador();
  atualizarTotal();
});

atualizarContador();
atualizarTotal();
