"""Confere que os avisos de exemplo acompanham o dia atual (dados.js: dataEmDias), para a demonstração em qualquer data.
Uso: python testes/test_datas_exemplo.py [chromium|firefox|webkit]"""
import subprocess, sys, time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

NAVEGADOR = sys.argv[1] if len(sys.argv) > 1 else "chromium"
RAIZ = Path(__file__).resolve().parents[1]
PORT = 5596
BASE = f"http://localhost:{PORT}/src/pages/"
resultados = []


def check(nome, cond, extra=""):
    resultados.append((nome, bool(cond)))
    print(("PASS " if cond else "FAIL ") + nome + (f"  [{extra}]" if extra else ""))


server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--directory", str(RAIZ)],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)


def status_em(browser, hoje):
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.clock.set_fixed_time(hoje)
    page.goto(BASE + "avisos.html")
    status = page.locator("#avisos-corpo tr td:nth-child(4)").all_inner_texts()
    datas = page.locator("#avisos-corpo tr td:nth-child(1)").all_inner_texts()
    page.goto(BASE + "index.html")
    prazos = page.locator("#proximos-prazos .card").count()
    ctx.close()
    return status, datas, prazos


try:
    with sync_playwright() as pw:
        b = getattr(pw, NAVEGADOR).launch()
        # dia da 4ª entrega: os quatro status aparecem e a tela inicial tem 3 prazos futuros
        st, datas, prazos = status_em(b, datetime(2026, 11, 23, 10, 0, 0))
        check("23/11/2026: 9 avisos, 1 Encerrado, 1 Urgente, 4 Em breve e 3 Em dia",
              len(st) == 9 and st.count("Encerrado") == 1 and st.count("Urgente") == 1 and st.count("Em breve") == 4 and st.count("Em dia") == 3, str(st))
        check("23/11/2026: tela inicial mostra 3 próximos prazos", prazos == 3, str(prazos))
        check("23/11/2026: o aviso do relatório de extensão mantém a data real (27/11/2026)", "27/11/2026" in datas, str(datas))
        # dia da apresentação final: continua havendo prazos futuros e status variados
        st, datas, prazos = status_em(b, datetime(2026, 11, 30, 10, 0, 0))
        check("30/11/2026: tela inicial mostra 3 próximos prazos", prazos == 3, str(prazos))
        check("30/11/2026: há avisos Urgente, Em breve e Em dia e o de 27/11 aparece como Encerrado",
              "Urgente" in st and "Em breve" in st and "Em dia" in st and st[0] == "Encerrado", str(st))
        # dia fixado nos testes: as datas originais de 09/10 a 20/11 são reproduzidas
        st, datas, prazos = status_em(b, datetime(2026, 10, 21, 10, 0, 0))
        check("21/10/2026: datas originais reproduzidas (09/10, 23/10, 28/10, 30/10, 04/11, 10/11, 13/11, 20/11, 27/11)",
              datas == ["09/10/2026", "23/10/2026", "28/10/2026", "30/10/2026", "04/11/2026", "10/11/2026", "13/11/2026", "20/11/2026", "27/11/2026"], str(datas))
        b.close()
finally:
    server.terminate()

falhas = [r for r in resultados if not r[1]]
print(f"\n{len(resultados) - len(falhas)}/{len(resultados)} verificações passaram")
for f in falhas:
    print("FALHOU:", f[0])
sys.exit(1 if falhas else 0)
