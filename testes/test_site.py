"""150 verificações automatizadas do site (Playwright).
Uso: python testes/test_site.py [chromium|firefox|webkit]"""
import json, subprocess, sys, time
NAVEGADOR = sys.argv[1] if len(sys.argv) > 1 else "chromium"  # chromium, firefox ou webkit
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[1]  # pasta do projeto (onde fica o index.html)
PORT = 5599
BASE = f"http://localhost:{PORT}/src/pages/"
HOJE = datetime(2026, 10, 21, 10, 0, 0)

resultados = []
def check(nome, cond, extra=""):
    resultados.append((nome, bool(cond)))
    print(("PASS " if cond else "FAIL ") + nome + (f"  [{extra}]" if extra else ""))

server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--directory", str(RAIZ)],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)

def novo_contexto(browser, largura=1280, altura=900):
    ctx = browser.new_context(viewport={"width": largura, "height": altura})
    page = ctx.new_page()
    page.clock.set_fixed_time(HOJE)
    erros = []
    page.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: erros.append(str(e)))
    return ctx, page, erros

def cadastrar(page, nome="Maria da Silva", email="maria@puccampinas.edu.br", senha="abc123", curso="Psicologia", tipo="estudante"):
    page.goto(BASE + "cadastro.html")
    page.fill("#nome", nome); page.fill("#email", email)
    page.fill("#senha", senha); page.fill("#confirmar-senha", senha)
    page.select_option("#curso-interesse", curso)
    page.select_option("#tipo", tipo)
    page.check("#termos")
    page.click("button[type=submit]")
    page.wait_for_url("**/perfil.html", timeout=5000)

try:
    with sync_playwright() as pw:
        browser = getattr(pw, NAVEGADOR).launch()

        # ---------------- Início ----------------
        ctx, page, erros = novo_contexto(browser)
        page.goto(BASE + "index.html")
        check("Início: 3 cursos em destaque gerados pelo JS", page.locator("#destaques .card").count() == 3)
        check("Início: 3 próximos prazos (apenas futuros)", page.locator("#proximos-prazos .card").count() == 3)
        prazos = page.locator("#proximos-prazos").inner_text()
        check("Início: prazo mais próximo é o de 23/10 (vence em 2 dias)", "Vence em 2 dias" in prazos and "23/10/2026" in prazos, prazos[:120])
        check("Início: aviso encerrado (09/10) não aparece", "09/10" not in prazos)
        check("Início: link do card aponta para ?id=", page.get_attribute("#destaques a", "href").startswith("curso-detalhe.html?id="))

        # ---------------- Cursos ----------------
        page.goto(BASE + "cursos.html")
        check("Cursos: 10 cursos listados", page.locator("#lista-cursos .card").count() == 10 and "10 cursos encontrados" in page.inner_text("#contagem-cursos"))
        page.fill("#busca", "psico")
        check("Cursos: busca 'psico' encontra 2", page.locator("#lista-cursos .card").count() == 2)
        page.fill("#busca", "administracao")
        check("Cursos: busca ignora acentos (administracao -> 2)", page.locator("#lista-cursos .card").count() == 2)
        page.fill("#busca", "")
        page.fill("#busca", "oficina"); page.click("#form-filtros button[type=submit]")
        check("Cursos: botão Filtrar não recarrega a página e mantém o filtro", page.url.endswith("cursos.html") and page.locator("#lista-cursos .card").count() == 1)
        page.fill("#busca", "")
        page.select_option("#area", "Tecnologia")
        check("Cursos: filtro área Tecnologia -> 3", page.locator("#lista-cursos .card").count() == 3)
        page.select_option("#modalidade", "Extensão")
        check("Cursos: Tecnologia + Extensão -> 1 (singular)", page.locator("#lista-cursos .card").count() == 1 and page.inner_text("#contagem-cursos") == "1 curso encontrado")
        page.select_option("#periodo", "EAD")
        check("Cursos: combinação sem resultado mostra mensagem", page.is_visible("#sem-resultados") and page.locator("#lista-cursos .card").count() == 0)
        page.select_option("#periodo", "")
        page.click("#lista-cursos .card a")  # vai para os detalhes
        page.wait_for_url("**/curso-detalhe.html?id=*")
        page.go_back(); page.wait_for_url("**/cursos.html")
        check("Cursos: filtros restaurados do sessionStorage ao voltar", page.input_value("#area") == "Tecnologia" and page.locator("#lista-cursos .card").count() == 1)
        page.click("#btn-limpar")
        check("Cursos: Limpar filtros volta aos 10 cursos", page.locator("#lista-cursos .card").count() == 10 and page.input_value("#busca") == "")

        # ---------------- Detalhes ----------------
        page.goto(BASE + "curso-detalhe.html?id=eng-computacao")
        check("Detalhes: título e dados do curso", page.inner_text("#curso-titulo") == "Engenharia da Computação" and page.inner_text("#info-carga") == "3.600 horas"
              and page.locator("#curso-conteudo li").count() == 5)
        check("Detalhes: prazo do curso listado", "Matrícula — Engenharia da Computação" in page.inner_text("#curso-prazos"))
        check("Detalhes: título da aba atualizado", "Engenharia da Computação" in page.title())
        check("Detalhes: sem login mostra aviso para entrar", "Entre na sua conta" in page.inner_text("#msg-salvar"))
        page.goto(BASE + "curso-detalhe.html?id=inexistente")
        check("Detalhes: id inválido mostra 'Curso não encontrado'", page.is_visible("#curso-nao-encontrado") and page.is_hidden("#conteudo-curso"))
        page.goto(BASE + "curso-detalhe.html")
        check("Detalhes: sem id mostra 'Curso não encontrado'", page.is_visible("#curso-nao-encontrado"))
        page.goto(BASE + "curso-detalhe.html?id=psicologia")
        page.click("#btn-salvar-interesse"); page.wait_for_url("**/login.html")
        check("Detalhes: salvar sem login leva ao login", page.url.endswith("login.html"))

        # ---------------- Perfil sem login ----------------
        page.goto(BASE + "perfil.html")
        check("Perfil sem sessão: acesso restrito e conteúdo oculto", page.is_visible("#perfil-restrito") and page.is_hidden("#perfil-conteudo"))
        check("Sem erros de JavaScript (Início a Perfil)", not erros, str(erros))
        ctx.close()

        # ---------------- Cadastro ----------------
        ctx, page, erros = novo_contexto(browser)
        page.goto(BASE + "cadastro.html")
        page.click("button[type=submit]")
        check("Cadastro vazio: erro em nome, e-mail, senha, confirmação e termos",
              all(page.inner_text(f"#erro-{c}") != "" for c in ["nome", "email", "senha", "confirmar-senha", "termos"]))
        check("Cadastro vazio: aria-invalid e mensagem geral", page.get_attribute("#nome", "aria-invalid") == "true" and "Corrija" in page.inner_text("#mensagem-cadastro"))
        check("Cadastro vazio: foco no primeiro campo inválido", page.evaluate("document.activeElement.id") == "nome")
        check("Cadastro vazio: nada gravado", page.evaluate("localStorage.getItem('wifidafe_usuario')") is None)
        page.fill("#nome", "Maria"); page.fill("#email", "maria@"); page.fill("#senha", "123")
        page.click("button[type=submit]")
        check("Cadastro: nome sem sobrenome", "nome e sobrenome" in page.inner_text("#erro-nome").lower())
        check("Cadastro: e-mail inválido", "e-mail válido" in page.inner_text("#erro-email"))
        check("Cadastro: senha curta", "6 caracteres" in page.inner_text("#erro-senha"))
        page.fill("#email", "maria@puccampinas.edu.br")
        check("Cadastro: erro some ao corrigir (tempo real)", page.inner_text("#erro-email") == "" and "campo--ok" in page.get_attribute("#email", "class"))
        page.fill("#senha", "abc"); check("Cadastro: força fraca", page.inner_text("#forca-senha") == "Senha fraca")
        page.fill("#senha", "abcdef1"); check("Cadastro: força média", page.inner_text("#forca-senha") == "Senha média")
        page.fill("#senha", "abc123!xyz9"); check("Cadastro: força forte", page.inner_text("#forca-senha") == "Senha forte")
        page.fill("#confirmar-senha", "outra"); page.click("button[type=submit]")
        check("Cadastro: senhas diferentes", "não coincidem" in page.inner_text("#erro-confirmar-senha"))
        page.fill("#senha", "abc123");
        check("Cadastro: alterar a senha reavalia a confirmação", "não coincidem" in page.inner_text("#erro-confirmar-senha"))
        page.fill("#confirmar-senha", "abc123")
        page.click("#form-cadastro [data-alternar-senha=senha]")
        check("Cadastro: botão Mostrar troca o tipo do campo", page.get_attribute("#senha", "type") == "text" and page.get_attribute("[data-alternar-senha=senha]", "aria-pressed") == "true")
        page.click("#form-cadastro [data-alternar-senha=senha]")
        check("Cadastro: Ocultar volta para password", page.get_attribute("#senha", "type") == "password")
        page.fill("#nome", "Maria da Silva")
        page.click("button[type=submit]")
        check("Cadastro: termos obrigatórios", "termos" in page.inner_text("#erro-termos"))
        page.check("#termos"); page.select_option("#curso-interesse", "Psicologia")
        page.click("button[type=submit]")
        check("Cadastro válido: mensagem de sucesso", "Conta criada" in page.inner_text("#mensagem-cadastro"))
        page.wait_for_url("**/perfil.html", timeout=5000)
        usuario = json.loads(page.evaluate("localStorage.getItem('wifidafe_usuario')"))
        check("Cadastro: conta salva no localStorage sem senha", usuario["email"] == "maria@puccampinas.edu.br" and usuario["nome"] == "Maria da Silva"
              and "senha" not in usuario and "abc123" not in json.dumps(page.evaluate("Object.assign({}, localStorage)")))
        check("Cadastro: sessão no sessionStorage (não no localStorage)", page.evaluate("sessionStorage.getItem('wifidafe_sessao')") is not None and page.evaluate("localStorage.getItem('wifidafe_sessao')") is None)

        # ---------------- Perfil logado ----------------
        check("Perfil: dados do usuário e conteúdo visível", page.inner_text("#perfil-nome") == "Maria da Silva" and page.inner_text("#perfil-curso") == "Psicologia"
              and page.is_visible("#perfil-conteudo") and page.is_hidden("#perfil-restrito"))
        check("Perfil: navbar mostra 'Olá, Maria' e Sair", "Olá, Maria" in page.inner_text(".navbar__actions") and page.is_visible(".navbar__actions button"))
        check("Perfil: tabela vazia orienta a salvar cursos", "Nenhum curso salvo" in page.inner_text("#cursos-salvos-body"))
        page.goto(BASE + "curso-detalhe.html?id=psicologia")
        page.click("#btn-salvar-interesse")
        check("Detalhes logado: salvar curso", "Curso salvo" in page.inner_text("#msg-salvar") and page.inner_text("#btn-salvar-interesse") == "Remover dos salvos")
        page.goto(BASE + "curso-detalhe.html?id=oficina-web"); page.click("#btn-salvar-interesse")
        page.goto(BASE + "curso-detalhe.html?id=psicologia")
        check("Detalhes: estado 'salvo' lembrado após recarregar", page.inner_text("#btn-salvar-interesse") == "Remover dos salvos")
        page.goto(BASE + "perfil.html")
        check("Perfil: 2 cursos salvos na tabela", page.locator("#cursos-salvos-body tr").count() == 2 and "2 itens salvos" in page.inner_text("#resumo-salvos"))
        page.select_option("#cursos-salvos-body tr:first-child select", "Matriculado")
        page.reload()
        salvos = json.loads(page.evaluate("localStorage.getItem('wifidafe_cursos_salvos')"))
        check("Perfil: status alterado e persistido", salvos[0]["status"] == "Matriculado" and page.input_value("#cursos-salvos-body tr:first-child select") == "Matriculado")
        page.click("#cursos-salvos-body tr:last-child button")
        check("Perfil: remover curso atualiza a lista", page.locator("#cursos-salvos-body tr").count() == 1 and "1 item salvo" in page.inner_text("#resumo-salvos"))
        # edição de dados
        page.click("#btn-editar")
        check("Perfil: formulário de edição aparece com os valores atuais", page.is_visible("#form-perfil") and page.input_value("#form-perfil #nome") == "Maria da Silva")
        page.fill("#form-perfil #nome", "Ana"); page.click("#form-perfil button[type=submit]")
        check("Perfil: edição inválida (sem sobrenome) bloqueada", "sobrenome" in page.inner_text("#form-perfil #erro-nome") and page.inner_text("#perfil-nome") == "Maria da Silva")
        page.fill("#form-perfil #nome", "Ana Paula Souza"); page.select_option("#form-perfil #curso-interesse", "Direito")
        page.click("#form-perfil button[type=submit]")
        check("Perfil: dados atualizados na tela, navbar e storage", page.inner_text("#perfil-nome") == "Ana Paula Souza" and page.inner_text("#perfil-curso") == "Direito"
              and "Olá, Ana" in page.inner_text(".navbar__actions") and "Ana Paula Souza" in page.evaluate("localStorage.getItem('wifidafe_usuario')") and page.is_hidden("#form-perfil"))
        # sair
        page.click("#btn-sair"); page.wait_for_url("**/login.html?saiu=1")
        check("Logout: sessão removida e mensagem exibida", page.evaluate("sessionStorage.getItem('wifidafe_sessao')") is None and "Você saiu" in page.inner_text("#mensagem-login"))
        check("Logout: conta e cursos continuam salvos", page.evaluate("localStorage.getItem('wifidafe_usuario')") is not None and "Matriculado" in page.evaluate("localStorage.getItem('wifidafe_cursos_salvos')"))
        page.goto(BASE + "perfil.html")
        check("Após logout o perfil é restrito", page.is_visible("#perfil-restrito") and page.is_hidden("#perfil-conteudo"))

        # ---------------- Login ----------------
        page.goto(BASE + "login.html")
        page.click("button[type=submit]")
        check("Login vazio: erros nos dois campos", page.inner_text("#erro-email") != "" and page.inner_text("#erro-senha") != "")
        page.fill("#email", "outra@puccampinas.edu.br"); page.fill("#senha", "123456"); page.click("button[type=submit]")
        check("Login: e-mail sem conta", "Não encontramos" in page.inner_text("#mensagem-login"))
        page.fill("#email", "ANA@x.com")
        page.fill("#email", "MARIA@PUCCAMPINAS.EDU.BR"); page.fill("#senha", "12345"); page.click("button[type=submit]")
        check("Login: senha curta bloqueada", "6 caracteres" in page.inner_text("#erro-senha"))
        page.fill("#senha", "qualquer1"); page.check("#manter"); page.click("button[type=submit]")
        check("Login válido: mensagem de sucesso", "Login realizado" in page.inner_text("#mensagem-login"))
        page.wait_for_url("**/perfil.html", timeout=5000)
        check("Login 'manter conectado': sessão no localStorage", page.evaluate("localStorage.getItem('wifidafe_sessao')") is not None and page.evaluate("sessionStorage.getItem('wifidafe_sessao')") is None)
        check("Login: e-mail comparado sem diferenciar maiúsculas", page.inner_text("#perfil-email") == "maria@puccampinas.edu.br")
        page.click("#btn-sair"); page.wait_for_url("**/login.html?saiu=1")
        # excluir conta
        page.fill("#email", "maria@puccampinas.edu.br"); page.fill("#senha", "123456"); page.click("button[type=submit]")
        page.wait_for_url("**/perfil.html", timeout=5000)
        page.once("dialog", lambda d: d.accept())
        page.click("#btn-excluir"); page.wait_for_url("**/index.html")
        check("Excluir conta: apaga tudo que o site gravou", page.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('wifidafe')).length") == 0)
        check("Sem erros de JavaScript (Cadastro, Perfil, Login)", not erros, str(erros))
        ctx.close()

        # ---------------- Avisos ----------------
        ctx, page, erros = novo_contexto(browser)
        page.goto(BASE + "avisos.html")
        check("Avisos: 9 linhas ordenadas por data", page.locator("#avisos-corpo tr").count() == 9)
        check("Avisos: rodapé 'Total de avisos ativos' = 8 (1 encerrado fica de fora)", page.inner_text("#total-ativos") == "8", page.inner_text("#total-ativos"))
        check("Avisos: resumo com urgentes", "Mostrando 9 de 9 avisos · 1 urgente" == page.inner_text("#resumo-avisos"), page.inner_text("#resumo-avisos"))
        status = page.locator("#avisos-corpo tr td:nth-child(4)").all_inner_texts()
        check("Avisos: status calculado pela data (21/10/2026)", status[0] == "Encerrado" and status[1] == "Urgente" and status[2] == "Em breve" and status[-1] == "Em dia", str(status))
        page.select_option("#categoria", "Extensão")
        check("Avisos: filtro por categoria", page.locator("#avisos-corpo tr").count() == 4)
        page.select_option("#situacao", "urgente")
        check("Avisos: Extensão + urgente -> vazio", page.is_visible("#avisos-vazio") and page.locator("#avisos-corpo tr").count() == 0)
        page.click("#btn-limpar-avisos")
        page.select_option("#situacao", "encerrado")
        check("Avisos: filtro por status encerrado", page.locator("#avisos-corpo tr").count() == 1)
        page.click("#btn-limpar-avisos")
        page.click("#avisos-corpo tr:nth-child(2) button")
        check("Avisos: marcar como lido altera linha e botão", "linha--lida" in page.get_attribute("#avisos-corpo tr:nth-child(2)", "class")
              and page.inner_text("#avisos-corpo tr:nth-child(2) button") == "Marcar como não lido")
        page.reload()
        check("Avisos: leitura persistida no localStorage", "linha--lida" in page.get_attribute("#avisos-corpo tr:nth-child(2)", "class"))
        page.check("#ocultar-lidos")
        check("Avisos: ocultar lidos", page.locator("#avisos-corpo tr").count() == 8 and "0 urgentes" in page.inner_text("#resumo-avisos"))
        check("Sem erros de JavaScript (Avisos)", not erros, str(erros))
        ctx.close()

        # ---------------- Contato ----------------
        ctx, page, erros = novo_contexto(browser)
        page.goto(BASE + "contato.html")
        page.click("button[type=submit]")
        check("Contato vazio: erros em nome, e-mail e mensagem", all(page.inner_text(f"#erro-{c}") != "" for c in ["nome", "email", "mensagem"]))
        page.fill("#mensagem", "curta"); page.click("button[type=submit]")
        check("Contato: mensagem curta", "10 caracteres" in page.inner_text("#erro-mensagem"))
        page.fill("#mensagem", "x" * 460)
        check("Contato: contador de caracteres e alerta", page.inner_text("#contador-mensagem") == "460/500 caracteres" and "contador--alerta" in page.get_attribute("#contador-mensagem", "class"))
        page.fill("#nome", "João Pereira"); page.fill("#email", "joao@exemplo.com"); page.select_option("#assunto", "Sugestão para a plataforma")
        page.fill("#mensagem", "Gostaria de sugerir um filtro por campus na lista de cursos.")
        page.click("button[type=submit]")
        msgs = json.loads(page.evaluate("localStorage.getItem('wifidafe_mensagens_contato')"))
        check("Contato válido: mensagem registrada com assunto e data", len(msgs) == 1 and msgs[0]["assunto"] == "Sugestão para a plataforma" and msgs[0]["data"])
        check("Contato: sucesso, campo limpo e total atualizado", "nº 1" in page.inner_text("#mensagem-contato") and page.input_value("#mensagem") == "" and "registradas neste navegador: 1" in page.inner_text("#total-enviadas"))
        page.goto(BASE + "contato.html")
        check("Contato: total persiste ao recarregar", "registradas neste navegador: 1" in page.inner_text("#total-enviadas"))
        check("Sem erros de JavaScript (Contato)", not erros, str(erros))
        ctx.close()

        # ---------------- Painel de responsáveis ----------------
        ctx, page, erros = novo_contexto(browser)
        page.on("dialog", lambda d: d.accept())  # confirmações de substituir conta, excluir e restaurar
        page.goto(BASE + "painel.html")
        check("Painel sem login: acesso restrito e conteúdo oculto", page.is_visible("#painel-restrito") and page.is_hidden("#painel-conteudo") and page.is_visible("#painel-link-login"))
        cadastrar(page, nome="Estudante Comum", email="aluno@x.com", tipo="estudante")
        check("Painel: conta de estudante não vê o item Painel no menu", page.locator("#navbar-menu a[href='painel.html']").count() == 0 and page.is_hidden("#link-painel") and page.inner_text("#perfil-tipo") == "Estudante")
        page.goto(BASE + "painel.html")
        check("Painel: estudante recebe acesso restrito com o motivo", page.is_visible("#painel-restrito") and "estudante" in page.inner_text("#painel-motivo") and page.is_hidden("#painel-conteudo"))
        cadastrar(page, nome="Rita Responsavel", email="rita@puc.br", tipo="responsavel")
        check("Painel: responsável vê o tipo de conta, o link e o item Painel no menu", page.inner_text("#perfil-tipo").startswith("Responsável") and page.is_visible("#link-painel") and page.locator("#navbar-menu a[href='painel.html']").count() == 1)
        page.click("#link-painel"); page.wait_for_url("**/painel.html")
        check("Painel: responsável acessa e vê as tabelas de cursos e avisos", page.is_visible("#painel-conteudo") and page.locator("#painel-cursos-corpo tr").count() == 10 and page.locator("#painel-avisos-corpo tr").count() == 9)
        check("Painel: item do menu fica marcado como página atual", page.get_attribute("#navbar-menu a[href='painel.html']", "aria-current") == "page")
        page.click("#btn-salvar-curso")
        check("Painel: curso vazio mostra erros em todos os campos obrigatórios", all(page.inner_text(f"#erro-{c}") != "" for c in ["curso-nome", "curso-carga", "curso-duracao", "curso-responsavel", "curso-resumo", "curso-conteudo"])
              and page.evaluate("localStorage.getItem('wifidafe_cursos')") is None)
        page.fill("#curso-nome", "Oficina de Robótica"); page.select_option("#curso-area", "Tecnologia"); page.select_option("#curso-modalidade", "Extensão"); page.select_option("#curso-periodo", "Noturno")
        page.fill("#curso-carga", "40 horas"); page.fill("#curso-duracao", "1 mês"); page.fill("#curso-responsavel", "Prof. Rita"); page.fill("#curso-resumo", "Oficina prática de robótica para iniciantes.")
        page.fill("#curso-conteudo", "Sensores\nMotores\n\nProgramação"); page.click("#btn-salvar-curso")
        check("Painel: curso adicionado, mensagem de sucesso e formulário limpo", page.locator("#painel-cursos-corpo tr").count() == 11 and "adicionado" in page.inner_text("#mensagem-painel") and page.input_value("#curso-nome") == "")
        page.goto(BASE + "cursos.html")
        check("Cursos: o novo curso aparece na lista (11 cursos)", page.locator("#lista-cursos .card").count() == 11)
        page.fill("#busca", "robotica")
        check("Cursos: busca (sem acento) encontra o curso criado no painel", page.locator("#lista-cursos .card").count() == 1)
        page.click("#lista-cursos .card a"); page.wait_for_url("**/curso-detalhe.html?id=*")
        check("Detalhes: dados e conteúdo do curso criado (linhas vazias ignoradas)", page.inner_text("#curso-titulo") == "Oficina de Robótica" and page.inner_text("#info-carga") == "40 horas" and page.locator("#curso-conteudo li").count() == 3)
        page.click("#btn-salvar-interesse")
        page.goto(BASE + "painel.html")
        page.click("#painel-cursos-corpo tr:has-text('Oficina de Robótica') button:has-text('Editar')")
        check("Painel: Editar preenche o formulário e muda o título e o botão", page.input_value("#curso-carga") == "40 horas" and page.inner_text("#btn-salvar-curso") == "Salvar alterações" and page.is_visible("#btn-cancelar-curso"))
        page.fill("#curso-carga", "60 horas"); page.click("#btn-salvar-curso")
        page.goto(BASE + "cursos.html"); page.fill("#busca", "robotica"); page.click("#lista-cursos .card a")
        check("Painel: edição do curso aparece nos detalhes", page.inner_text("#info-carga") == "60 horas")
        page.goto(BASE + "painel.html")
        page.click("#btn-salvar-aviso")
        check("Painel: aviso vazio mostra erros de título e data", page.inner_text("#erro-aviso-titulo") != "" and page.inner_text("#erro-aviso-data") != "")
        page.fill("#aviso-titulo", "Inscrições — Oficina de Robótica"); page.fill("#aviso-data", "2026-10-24"); page.select_option("#aviso-categoria", "Extensão")
        page.select_option("#aviso-curso", label="Oficina de Robótica"); page.click("#btn-salvar-aviso")
        check("Painel: aviso adicionado com status Urgente", page.locator("#painel-avisos-corpo tr").count() == 10 and "Urgente" in page.inner_text("#painel-avisos-corpo tr:has-text('Robótica')"))
        page.goto(BASE + "avisos.html")
        check("Avisos: o aviso criado no painel aparece (10 linhas, 2 urgentes)", page.locator("#avisos-corpo tr").count() == 10 and "2 urgentes" in page.inner_text("#resumo-avisos"), page.inner_text("#resumo-avisos"))
        page.goto(BASE + "index.html")
        check("Início: aviso novo entra nos próximos prazos em ordem de data", "Robótica" in page.inner_text("#proximos-prazos") and page.locator("#proximos-prazos .card").count() == 3)
        page.goto(BASE + "painel.html")
        page.click("#painel-cursos-corpo tr:has-text('Oficina de Robótica') button:has-text('Excluir')")
        check("Painel: excluir curso o remove e deixa o aviso como geral", page.locator("#painel-cursos-corpo tr").count() == 10 and "Aviso geral" in page.inner_text("#painel-avisos-corpo tr:has-text('Robótica')"))
        check("Painel: curso excluído sai da lista de salvos do perfil", "robotica" not in page.evaluate("localStorage.getItem('wifidafe_cursos_salvos') || ''"))
        page.reload()
        check("Painel: alterações persistem após recarregar", page.locator("#painel-cursos-corpo tr").count() == 10 and page.locator("#painel-avisos-corpo tr").count() == 10)
        page.click("#btn-restaurar")
        check("Painel: restaurar volta aos dados de exemplo (10 cursos, 9 avisos)", page.locator("#painel-avisos-corpo tr").count() == 9 and page.evaluate("localStorage.getItem('wifidafe_avisos')") is None and page.evaluate("localStorage.getItem('wifidafe_cursos')") is None)
        check("Sem erros de JavaScript (Painel)", not erros, str(erros))
        ctx.close()

        # ---------------- Sobre (acordeão) ----------------
        ctx, page, erros = novo_contexto(browser)
        page.goto(BASE + "sobre.html")
        check("Sobre: respostas do FAQ começam ocultas", page.locator(".acordeao__resposta:visible").count() == 0)
        page.click("#faq-botao-2")
        check("Sobre: acordeão abre (aria-expanded e texto visível)", page.get_attribute("#faq-botao-2", "aria-expanded") == "true" and page.is_visible("#faq-resposta-2"))
        page.click("#faq-botao-2")
        check("Sobre: acordeão fecha", page.is_hidden("#faq-resposta-2") and page.get_attribute("#faq-botao-2", "aria-expanded") == "false")
        check("Sem erros de JavaScript (Sobre)", not erros, str(erros))
        ctx.close()

        # ---------------- Segurança: HTML digitado vira texto ----------------
        ctx, page, erros = novo_contexto(browser)
        cadastrar(page, nome="<img src=x onerror=window.__x=1> Teste", email="x@y.com")
        check("Segurança: nome com HTML é exibido como texto (sem executar)", page.evaluate("window.__x") is None and "<img" in page.inner_text("#perfil-nome"))
        ctx.close()

        # ---------------- Responsividade ----------------
        paginas = ["index", "login", "cadastro", "cursos", "curso-detalhe?id=psicologia", "avisos", "perfil", "painel", "sobre", "contato"]
        for largura, nome_vp in [(360, "celular"), (768, "tablet"), (1280, "desktop")]:
            ctx, page, erros = novo_contexto(browser, largura, 900)
            for p in paginas:
                page.goto(BASE + (p + ".html" if "?" not in p else p.replace("?", ".html?")))
                page.wait_for_timeout(150)
                overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                check(f"Responsivo {nome_vp} ({largura}px): {p} sem rolagem horizontal", overflow <= 0, f"excesso {overflow}px")
            page.goto(BASE + "avisos.html")
            if largura <= 640:
                check(f"Responsivo {nome_vp}: tabela de avisos empilhada (cabeçalho oculto)", page.evaluate("getComputedStyle(document.querySelector('#avisos-corpo tr')).display") == "block")
            else:
                check(f"Responsivo {nome_vp}: tabela de avisos em colunas", page.evaluate("getComputedStyle(document.querySelector('#avisos-corpo tr')).display") == "table-row")
            if largura < 720:
                check(f"Responsivo {nome_vp}: botão de menu visível e menu recolhido", page.is_visible("#menu-toggle") and not page.is_visible("#navbar-menu"))
                page.click("#menu-toggle")
                check(f"Responsivo {nome_vp}: menu abre pelo botão (aria-expanded)", page.is_visible("#navbar-menu") and page.get_attribute("#menu-toggle", "aria-expanded") == "true")
                page.keyboard.press("Escape")
                check(f"Responsivo {nome_vp}: Esc fecha o menu", not page.is_visible("#navbar-menu") and page.get_attribute("#menu-toggle", "aria-expanded") == "false")
            else:
                check(f"Responsivo {nome_vp}: menu horizontal sempre visível", page.is_visible("#navbar-menu") and not page.is_visible("#menu-toggle"))
            check(f"Sem erros de JavaScript ({nome_vp})", not erros, str(erros))
            ctx.close()
        browser.close()
finally:
    server.terminate()

Path(__file__).parent.joinpath("resultados", f"funcional_{NAVEGADOR}.json").write_text(
    json.dumps(resultados, ensure_ascii=False, indent=1), encoding="utf-8")
falhas = [r for r in resultados if not r[1]]
print(f"\n{len(resultados) - len(falhas)}/{len(resultados)} verificações passaram")
for f in falhas:
    print("FALHOU:", f[0])
