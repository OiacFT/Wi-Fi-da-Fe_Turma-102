"""Captura as mesmas telas do site em Chromium, Firefox e WebKit e monta figuras lado a lado.
Saída: pratica/docs/evidencias-4a-entrega/ (capturas individuais e figuras montadas)."""
import subprocess, sys, time
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[1]  # pasta do projeto (onde fica o index.html)
SAIDA = RAIZ / "docs" / "evidencias-4a-entrega"
SAIDA.mkdir(parents=True, exist_ok=True)
PORT = 5597
BASE = f"http://localhost:{PORT}/src/pages/"
HOJE = datetime(2026, 10, 21, 10, 0, 0)
NAVEGADORES = ["chromium", "firefox", "webkit"]
ROTULO = {"chromium": "Chromium", "firefox": "Firefox", "webkit": "WebKit (Safari)"}

server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--directory", str(RAIZ)],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)


def pagina(browser, largura, altura):
    ctx = browser.new_context(viewport={"width": largura, "height": altura})
    page = ctx.new_page()
    page.clock.set_fixed_time(HOJE)
    return ctx, page


try:
    with sync_playwright() as pw:
        for nome in NAVEGADORES:
            b = getattr(pw, nome).launch()
            versao = b.version
            # computador: Cursos filtrado e Avisos
            ctx, page = pagina(b, 1280, 800)
            page.goto(BASE + "cursos.html")
            page.fill("#busca", "psico")
            page.wait_for_timeout(300)
            page.screenshot(path=str(SAIDA / f"cursos_{nome}.png"))
            page.goto(BASE + "avisos.html")
            page.wait_for_timeout(300)
            page.screenshot(path=str(SAIDA / f"avisos_{nome}.png"))
            ctx.close()
            # celular: Avisos empilhado e menu aberto
            ctx, page = pagina(b, 375, 760)
            page.goto(BASE + "avisos.html")
            page.wait_for_timeout(300)
            page.screenshot(path=str(SAIDA / f"celular_avisos_{nome}.png"))
            page.click("#menu-toggle")
            page.wait_for_timeout(300)
            page.screenshot(path=str(SAIDA / f"celular_menu_{nome}.png"))
            ctx.close()
            (SAIDA / f"versao_{nome}.txt").write_text(versao, encoding="utf-8")
            b.close()
            print(nome, versao)
finally:
    server.terminate()

try:
    fonte = ImageFont.truetype("arial.ttf", 22)
except OSError:
    fonte = ImageFont.load_default()


def montar(prefixo, saida, largura_alvo):
    imgs = []
    for nome in NAVEGADORES:
        im = Image.open(SAIDA / f"{prefixo}_{nome}.png").convert("RGB")
        h = int(im.height * largura_alvo / im.width)
        imgs.append((nome, im.resize((largura_alvo, h), Image.LANCZOS)))
    topo, esp = 44, 12
    larg = largura_alvo * 3 + esp * 4
    alt = topo + max(i.height for _, i in imgs) + esp
    folha = Image.new("RGB", (larg, alt), "white")
    d = ImageDraw.Draw(folha)
    for k, (nome, im) in enumerate(imgs):
        x = esp + k * (largura_alvo + esp)
        versao = (SAIDA / f"versao_{nome}.txt").read_text(encoding="utf-8")
        d.text((x, 10), f"{ROTULO[nome]} {versao}", fill="black", font=fonte)
        folha.paste(im, (x, topo))
        d.rectangle([x - 1, topo - 1, x + im.width, topo + im.height], outline="#9ca3af")
    folha.save(SAIDA / saida)
    print("figura", saida, folha.size)


montar("avisos", "figura_avisos_desktop_3_navegadores.png", 560)
montar("cursos", "figura_cursos_desktop_3_navegadores.png", 560)
montar("celular_avisos", "figura_avisos_celular_3_navegadores.png", 330)
montar("celular_menu", "figura_menu_celular_3_navegadores.png", 330)
