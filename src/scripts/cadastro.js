// Wi-Fi da Fé — cadastro com validação (conta salva apenas neste navegador, sem back-end).
const formularioCadastro = document.getElementById("form-cadastro");
const mensagemCadastro = document.getElementById("mensagem-cadastro");
const indicadorSenha = document.getElementById("forca-senha");

ativarValidacaoEmTempoReal(formularioCadastro);
ativarMostrarSenha(formularioCadastro);

// Indicador de força da senha, atualizado a cada tecla.
formularioCadastro.elements.senha.addEventListener("input", (evento) => {
  const forca = forcaDaSenha(evento.target.value);
  indicadorSenha.textContent = forca.texto;
  indicadorSenha.className = "forca-senha" + (forca.nivel ? " forca-senha--" + forca.nivel : "");
  // Se a confirmação já foi preenchida, ela precisa ser conferida de novo.
  const confirmar = formularioCadastro.elements["confirmar-senha"];
  if (confirmar.value !== "") validarCampo(confirmar);
});

formularioCadastro.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(formularioCadastro)) {
    mostrarMensagem(mensagemCadastro, "erro", "Corrija os campos destacados para criar sua conta.");
    return;
  }
  const email = formularioCadastro.elements.email.value.trim().toLowerCase();
  const existente = obterUsuario();
  if (existente && existente.email === email) {
    mostrarMensagem(mensagemCadastro, "erro", "Este e-mail já tem conta neste navegador. Use a opção Entrar.");
    return;
  }
  if (existente && !window.confirm("Já existe uma conta (" + existente.email + ") neste navegador. Deseja substituí-la?")) {
    return;
  }
  salvarUsuario({
    nome: formularioCadastro.elements.nome.value.trim().replace(/\s+/g, " "),
    email: email,
    curso: formularioCadastro.elements["curso-interesse"].value,
    criadoEm: new Date().toISOString(),
  });
  iniciarSessao(email, false);
  mostrarMensagem(mensagemCadastro, "sucesso", "Conta criada com sucesso! Abrindo seu perfil...");
  formularioCadastro.querySelector("button[type=submit]").disabled = true;
  setTimeout(() => (window.location.href = "perfil.html"), 900);
});
