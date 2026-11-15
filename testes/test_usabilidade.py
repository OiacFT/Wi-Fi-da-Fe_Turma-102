"""Avaliação de usabilidade medida por script: contraste, estrutura, alvos de toque e passos por tarefa.
Uso: python testes/test_usabilidade.py [chromium|firefox|webkit]"""
import json, re, subprocess, sys, time
NAVEGADOR = sys.argv[1] if len(sys.argv) > 1 else "chromium"  # chromium, firefox ou webkit
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[1]  # pasta do projeto (onde fica o index.html)
SCR = Path(__file__).parent / "resultados"
PORT = 5598
BASE = f"http://localhost:{PORT}/src/pages/"
HOJE = datetime(2026, 10, 21, 10, 0, 0)
PAGINAS = ["index", "login", "cadastro", "cursos", "curso-detalhe?id=psicologia", "avisos", "perfil", "painel", "sobre", "contato"]
saida = {"contraste": [], "paginas": [], "alvos_toque": [], "tarefas": []}

# ---------- contraste WCAG (calculado dos tokens reais do CSS) ----------
def lum(hexa):
    h = hexa.lstrip("#")
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def razao(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)
def misturar(fg, bg, alfa):
    f = [int(fg.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]; b = [int(bg.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(x * alfa + y * (1 - alfa)):02x}" for x, y in zip(f, b))
tok = dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", (RAIZ / "src/styles/variables.css").read_text(encoding="utf-8")))
pares = [
    ("Texto principal sobre fundo", tok["color-text"], tok["color-bg"]),
    ("Texto principal sobre cartão", tok["color-text"], tok["color-surface"]),
    ("Texto secundário sobre cartão", tok["color-text-muted"], tok["color-surface"]),
    ("Link/botão primário (texto branco)", "#ffffff", tok["color-primary"]),
    ("Botão âmbar (texto escuro)", "#1e1204", tok["color-accent"]),
    ("Selo \"Em breve\" (âmbar escuro)", tok["color-accent-dark"], misturar(tok["color-accent"], "#ffffff", 0.15)),
    ("Selo \"Urgente\"", tok["color-danger"], tok["color-danger-bg"]),
    ("Selo \"Em dia\"", tok["color-success"], tok["color-success-bg"]),
    ("Mensagem de erro", tok["color-danger"], tok["color-danger-bg"]),
    ("Rodapé (texto claro)", "#e2e8f0", tok["color-primary-dark"]),
    ("Selo \"Encerrado\"", "#475569", "#e2e8f0"),
    ("Indicador \"Senha média\"", tok["color-accent-dark"], tok["color-surface"]),
    ("Texto secundário sobre fundo", tok["color-text-muted"], tok["color-bg"]),
]
for nome, fg, bg in pares:
    r = razao(fg, bg)
    saida["contraste"].append({"par": nome, "razao": round(r, 2), "minimo": 4.5, "ok": r >= 4.5})

server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--directory", str(RAIZ)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
try:
    with sync_playwright() as pw:
        b = getattr(pw, NAVEGADOR).launch()
        # ---------- estrutura e acessibilidade por página ----------
        ctx = b.new_context(viewport={"width": 1280, "height": 900}); page = ctx.new_page(); page.clock.set_fixed_time(HOJE)
        for p in PAGINAS:
            page.goto(BASE + (p + ".html" if "?" not in p else p.replace("?", ".html?"))); page.wait_for_timeout(150)
            r = page.evaluate("""() => {
              const visivel = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
              const campos = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(visivel);
              const semRotulo = campos.filter(c => !(c.labels && c.labels.length) && !c.getAttribute('aria-label')).length;
              const botoes = [...document.querySelectorAll('button, a')].filter(visivel);
              const semNome = botoes.filter(e => !(e.textContent.trim() || e.getAttribute('aria-label'))).length;
              return {titulo: document.title, lang: document.documentElement.lang, h1: [...document.querySelectorAll('h1')].filter(visivel).length,
                main: document.querySelectorAll('main').length, nav: document.querySelectorAll('nav').length,
                header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length,
                skip: !!document.querySelector('a.skip-link'), campos: campos.length, semRotulo, semNome,
                estiloInline: document.querySelectorAll('[style]').length, scriptInline: [...document.querySelectorAll('script:not([src])')].length};
            }""")
            r["pagina"] = p; saida["paginas"].append(r)
        ctx.close()

        # ---------- alvos de toque no celular (375 px) ----------
        ctx = b.new_context(viewport={"width": 375, "height": 800}, has_touch=True); page = ctx.new_page(); page.clock.set_fixed_time(HOJE)
        for p in ["index", "cursos", "avisos", "cadastro", "contato"]:
            page.goto(BASE + p + ".html"); page.wait_for_timeout(150)
            if p == "index":
                page.click("#menu-toggle")
            pequenos = page.evaluate("""() => [...document.querySelectorAll('button, a.btn, input[type=checkbox], select, input:not([type=checkbox]):not([type=hidden]), .navbar__menu a')]
                .filter(e => e.offsetWidth && e.offsetHeight).map(e => ({t: (e.textContent.trim() || e.id || e.name || e.type).slice(0, 30), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height)}))
                .filter(e => e.h < 36 && !(e.t === 'checkbox'))""")
            saida["alvos_toque"].append({"pagina": p, "menores_que_36px": pequenos})
        ctx.close()

        # ---------- tarefas e número de interações ----------
        def tarefa(nome, perfil, f):
            ctx = b.new_context(viewport={"width": 1280, "height": 900} if perfil != "celular" else {"width": 375, "height": 800}); page = ctx.new_page()
            page.clock.set_fixed_time(HOJE); page.on("dialog", lambda d: d.accept())
            passos = []
            def acao(descr, fn):
                fn()
                page.wait_for_load_state("load")  # a página pode ter navegado; o WebKit termina depois do Chromium
                page.wait_for_timeout(200)
                passos.append(descr)
            try:
                ok = f(page, acao)
            except Exception as e:
                ok = False; passos.append("ERRO: " + str(e)[:80])
            saida["tarefas"].append({"tarefa": nome, "perfil": perfil, "interacoes": len(passos), "concluida": bool(ok), "passos": passos})
            ctx.close()

        def t1(page, a):
            page.goto(BASE + "index.html")
            a("clicar em Ver cursos disponíveis", lambda: page.click("text=Ver cursos disponíveis"))
            a("digitar \"engenharia\" na busca", lambda: page.fill("#busca", "engenharia"))
            a("clicar em Ver detalhes", lambda: page.click("#lista-cursos a"))
            return "Matrícula — Engenharia da Computação" in page.inner_text("#curso-prazos") and "28/10/2026" in page.inner_text("#curso-prazos")
        tarefa("Descobrir o prazo de matrícula de Engenharia da Computação", "desktop", t1)

        def t2(page, a):
            page.goto(BASE + "index.html")
            a("clicar em Avisos no menu", lambda: page.click("#navbar-menu >> text=Avisos"))
            a("escolher o status Urgente", lambda: page.select_option("#situacao", "urgente"))
            return page.locator("#avisos-corpo tr").count() == 1
        tarefa("Ver só os avisos urgentes", "desktop", t2)

        def t3(page, a):
            page.goto(BASE + "index.html")
            a("clicar em Criar conta", lambda: page.click(".navbar__actions >> text=Criar conta"))
            a("preencher o nome", lambda: page.fill("#nome", "Maria da Silva"))
            a("preencher o e-mail", lambda: page.fill("#email", "maria@puccampinas.edu.br"))
            a("preencher a senha", lambda: page.fill("#senha", "abc123"))
            a("confirmar a senha", lambda: page.fill("#confirmar-senha", "abc123"))
            a("aceitar os termos", lambda: page.check("#termos"))
            a("clicar em Criar conta", lambda: page.click("button[type=submit]"))
            page.wait_for_url("**/perfil.html")
            a("clicar em Cursos no menu", lambda: page.click("#navbar-menu >> text=Cursos"))
            a("digitar \"psico\" na busca", lambda: page.fill("#busca", "psico"))
            a("clicar em Ver detalhes de Psicologia", lambda: page.click("#lista-cursos .card:first-child a"))
            a("clicar em Salvar interesse", lambda: page.click("#btn-salvar-interesse"))
            a("clicar em Perfil no menu", lambda: page.click("#navbar-menu >> text=Perfil"))
            return page.locator("#cursos-salvos-body tr").count() == 1 and "Nenhum" not in page.inner_text("#cursos-salvos-body")
        tarefa("Criar conta, salvar um curso e conferir no perfil", "desktop", t3)

        def t4(page, a):
            page.goto(BASE + "cadastro.html")
            page.fill("#nome", "Rita Responsavel"); page.fill("#email", "rita@puc.br"); page.fill("#senha", "abc123"); page.fill("#confirmar-senha", "abc123")
            page.select_option("#tipo", "responsavel"); page.check("#termos"); page.click("button[type=submit]"); page.wait_for_url("**/perfil.html")
            a("clicar em Painel no menu", lambda: page.click("#navbar-menu >> text=Painel"))
            a("preencher o título do aviso", lambda: page.fill("#aviso-titulo", "Inscrições abertas — Oficina nova"))
            a("escolher a data", lambda: page.fill("#aviso-data", "2026-11-05"))
            a("clicar em Adicionar aviso", lambda: page.click("#btn-salvar-aviso"))
            return page.locator("#painel-avisos-corpo tr").count() == 10
        tarefa("Responsável adiciona um aviso (conta já criada)", "desktop", t4)

        def t5(page, a):
            page.goto(BASE + "index.html")
            a("tocar em Menu", lambda: page.click("#menu-toggle"))
            a("tocar em Cursos", lambda: page.click("#navbar-menu >> text=Cursos"))
            page.wait_for_url("**/cursos.html")  # espera a navegação terminar (o WebKit é mais lento que o Chromium)
            return page.url.endswith("cursos.html") and page.locator("#lista-cursos .card").count() == 10
        tarefa("Abrir a lista de cursos pelo celular", "celular", t5)
        b.close()
finally:
    server.terminate()

(SCR / f"resultados_usabilidade_{NAVEGADOR}.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
print("== Contraste")
for c in saida["contraste"]:
    print(("OK   " if c["ok"] else "FALHA"), c["razao"], c["par"])
print("== Páginas")
for p in saida["paginas"]:
    probs = [k for k, v in {"sem lang": not p["lang"], "h1!=1": p["h1"] != 1, "sem main": p["main"] != 1, "sem skip": not p["skip"], "campo sem rótulo": p["semRotulo"], "controle sem nome": p["semNome"], "style inline": p["estiloInline"], "script inline": p["scriptInline"]}.items() if v]
    print(p["pagina"], "|", p["titulo"], "|", "PROBLEMAS: " + ", ".join(probs) if probs else "ok")
print("== Alvos de toque < 36px (375 px)")
for a in saida["alvos_toque"]:
    print(a["pagina"], a["menores_que_36px"])
print("== Tarefas")
for t in saida["tarefas"]:
    print(("OK   " if t["concluida"] else "FALHA"), t["interacoes"], "interações |", t["perfil"], "|", t["tarefa"])
