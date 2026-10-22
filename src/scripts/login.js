// Wi-Fi da Fé — login simulado (sem servidor).
// O e-mail é conferido com a conta salva neste navegador. A senha só é validada quanto ao formato e
// nunca é armazenada; num sistema real, essa conferência seria feita por um back-end.
const formularioLogin = document.getElementById("form-login");
const mensagemLogin = document.getElementById("mensagem-login");

ativarValidacaoEmTempoReal(formularioLogin);
ativarMostrarSenha(formularioLogin);

const parametrosLogin = new URLSearchParams(window.location.search);
if (parametrosLogin.get("saiu") === "1") {
  mostrarMensagem(mensagemLogin, "info", "Você saiu da sua conta.");
} else if (parametrosLogin.get("restrito") === "1") {
  mostrarMensagem(mensagemLogin, "info", "Entre na sua conta para acessar o perfil.");
} else if (obterUsuarioLogado()) {
  mostrarMensagem(mensagemLogin, "info", "Você já está conectado. Abra o Perfil pelo menu ou entre com outra conta.");
}

formularioLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(formularioLogin)) {
    mostrarMensagem(mensagemLogin, "erro", "Corrija os campos destacados e tente novamente.");
    return;
  }
  const email = formularioLogin.elements.email.value.trim().toLowerCase();
  const usuario = obterUsuario();
  if (!usuario) {
    mostrarMensagem(mensagemLogin, "erro", "Nenhuma conta foi criada neste navegador ainda. Use \"Cadastre-se\" primeiro.");
    return;
  }
  if (usuario.email !== email) {
    mostrarMensagem(mensagemLogin, "erro", "Não encontramos uma conta com esse e-mail neste navegador.");
    return;
  }
  iniciarSessao(usuario.email, formularioLogin.elements.manter.checked);
  mostrarMensagem(mensagemLogin, "sucesso", "Login realizado! Abrindo seu perfil...");
  formularioLogin.querySelector("button[type=submit]").disabled = true;
  setTimeout(() => (window.location.href = "perfil.html"), 800);
});
