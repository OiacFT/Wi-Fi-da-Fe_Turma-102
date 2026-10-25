// Wi-Fi da Fé — validação de formulários (usada em cadastro, login, contato e edição de perfil)
// Cada campo recebe uma mensagem de erro própria (<p class="erro-campo">) e os atributos de acessibilidade
// aria-invalid / aria-describedby. As mensagens são inseridas com textContent.

const REGRAS = {
  nome: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Informe seu nome completo.";
    if (texto.split(/\s+/).length < 2) return "Digite nome e sobrenome.";
    if (texto.length < 5) return "O nome está muito curto.";
    return "";
  },
  email: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return "Digite um e-mail válido, como nome@puccampinas.edu.br.";
    return "";
  },
  senha: (valor) => {
    if (valor === "") return "Informe sua senha.";
    if (valor.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    return "";
  },
  mensagem: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Escreva sua mensagem.";
    if (texto.length < 10) return "A mensagem precisa ter pelo menos 10 caracteres.";
    return "";
  },
  // As regras abaixo precisam do próprio campo (checkbox) ou de outro campo do formulário.
  confirmar: (valor, campo) => {
    if (valor === "") return "Confirme sua senha.";
    if (valor !== campo.form.elements.senha.value) return "As senhas não coincidem.";
    return "";
  },
  termos: (valor, campo) => (campo.checked ? "" : "Você precisa aceitar os termos de uso."),
  // Regras do painel de responsáveis (cursos e avisos)
  nomecurso: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Informe o nome do curso ou da prática.";
    if (texto.length < 3) return "O nome precisa ter pelo menos 3 caracteres.";
    return "";
  },
  titulo: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Informe o título do aviso.";
    if (texto.length < 5) return "O título precisa ter pelo menos 5 caracteres.";
    return "";
  },
  obrigatorio: (valor) => (valor.trim() === "" ? "Preencha este campo." : ""),
  resumo: (valor) => {
    const texto = valor.trim();
    if (texto === "") return "Escreva uma descrição curta do curso.";
    if (texto.length < 10) return "A descrição precisa ter pelo menos 10 caracteres.";
    return "";
  },
  conteudo: (valor) => (valor.split("\n").some((linha) => linha.trim() !== "") ? "" : "Informe pelo menos um item de conteúdo."),
  data: (valor) => (valor === "" ? "Escolha a data do prazo." : ""),
};

// Mostra (ou limpa) o erro de um campo. Devolve true quando o campo é válido.
function definirErroCampo(campo, mensagem) {
  const aviso = document.getElementById("erro-" + campo.id);
  campo.classList.toggle("campo--erro", mensagem !== "");
  campo.classList.toggle("campo--ok", mensagem === "" && campo.type !== "checkbox" && campo.value !== "");
  if (mensagem) {
    campo.setAttribute("aria-invalid", "true");
  } else {
    campo.removeAttribute("aria-invalid");
  }
  if (aviso) aviso.textContent = mensagem;
  return mensagem === "";
}

// Valida um campo com a regra informada (ou com a regra de mesmo nome do atributo data-regra).
function validarCampo(campo, regra) {
  const nomeRegra = regra || campo.dataset.regra;
  const mensagem = REGRAS[nomeRegra] ? REGRAS[nomeRegra](campo.value, campo) : "";
  return definirErroCampo(campo, mensagem);
}

// Valida todos os campos com data-regra do formulário e leva o foco ao primeiro inválido.
function validarFormulario(formulario) {
  const campos = [...formulario.querySelectorAll("[data-regra]")];
  const resultados = campos.map((campo) => validarCampo(campo));
  const primeiroInvalido = campos.find((campo, i) => !resultados[i]);
  if (primeiroInvalido) primeiroInvalido.focus();
  return !primeiroInvalido;
}

// Liga a validação ao sair do campo (blur) e a correção em tempo real (input) após o primeiro erro.
function ativarValidacaoEmTempoReal(formulario) {
  formulario.querySelectorAll("[data-regra]").forEach((campo) => {
    campo.addEventListener("blur", () => validarCampo(campo));
    campo.addEventListener("input", () => {
      if (campo.classList.contains("campo--erro")) validarCampo(campo);
    });
  });
}

// Exibe uma mensagem geral do formulário (sucesso, erro ou informação) na região role="status".
function mostrarMensagem(elemento, tipo, texto) {
  elemento.className = "mensagem mensagem--" + tipo;
  elemento.textContent = texto;
  elemento.hidden = texto === "";
}

// Botões "Mostrar senha": alternam o type do input entre password e text.
function ativarMostrarSenha(formulario) {
  formulario.querySelectorAll("[data-alternar-senha]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const campo = document.getElementById(botao.dataset.alternarSenha);
      const mostrar = campo.type === "password";
      campo.type = mostrar ? "text" : "password";
      botao.textContent = mostrar ? "Ocultar" : "Mostrar";
      botao.setAttribute("aria-pressed", String(mostrar));
    });
  });
}

// Classifica a força da senha (fraca, média ou forte) para o indicador do cadastro.
function forcaDaSenha(senha) {
  if (senha === "") return { nivel: "", texto: "" };
  let pontos = 0;
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Za-z]/.test(senha) && /\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  if (pontos <= 1) return { nivel: "fraca", texto: "Senha fraca" };
  if (pontos === 2) return { nivel: "media", texto: "Senha média" };
  return { nivel: "forte", texto: "Senha forte" };
}
