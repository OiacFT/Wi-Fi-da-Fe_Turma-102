"""Calcula os resultados do teste de usabilidade a partir das planilhas CSV preenchidas.

Uso:
    python testes/analisar_usabilidade.py [pasta_com_os_csv]

Arquivos lidos (em docs/teste-usabilidade/):
    tarefas.csv  : participante, dispositivo, tarefa, resultado, tempo_s, erros, observacao
                   resultado = sim | com dica | nao | nao aplicada | (vazio = sem registro na ficha)
    notas.csv    : participante, p1, p2, p3, p4, p5 (nota de 1 a 5; vazio = não respondeu)
Participantes com "P0" no nome são o piloto automatizado: contam como um dos testes de tarefas,
mas não têm tempo nem nota válidos (as notas dele não entram em notas.csv).
A saída é um texto em Markdown pronto para o documento. A meta é que pelo menos 75% dos testes (3 de 4)
tenham a tarefa concluída sozinha.
"""
import csv
import math
import statistics
import sys
from collections import defaultdict
from pathlib import Path

PASTA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "docs" / "teste-usabilidade"
META = 0.75
NOMES = {
    "1": "Descobrir o prazo de matrícula de Engenharia da Computação",
    "2": "Ver os avisos urgentes",
    "3": "Criar conta, salvar Psicologia e conferir no perfil",
    "4": "Enviar uma sugestão para a equipe",
    "5": "Abrir a lista de cursos (celular)",
    "6": "Cadastrar um aviso novo (responsável)",
}
PERGUNTAS = {
    "p1": "Foi fácil descobrir o que fazer em cada tela",
    "p2": "As mensagens de erro ajudaram a corrigir",
    "p3": "A aparência pareceu organizada e agradável",
    "p4": "Usaria um site assim para acompanhar prazos",
    "p5": "No celular, botões e textos foram fáceis de usar",
}


def ler(nome):
    caminho = PASTA / nome
    if not caminho.exists():
        sys.exit(f"Não encontrei {caminho}")
    with caminho.open(encoding="utf-8-sig", newline="") as f:
        return [{k.strip(): (v or "").strip() for k, v in linha.items()} for linha in csv.DictReader(f)]


def numero(txt):
    try:
        return float(txt.replace(",", "."))
    except ValueError:
        return None


def norm(res):
    r = res.lower().replace("não", "nao").strip()
    return {"sim": "sim", "com dica": "dica", "nao": "nao", "nao aplicada": "naoapl", "": "sem"}.get(r, "sem")


def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".") if v is not None else "-"


tarefas = [t for t in ler("tarefas.csv") if t.get("participante") and t.get("tarefa")]
notas = [n for n in ler("notas.csv") if any(n.get(p) for p in PERGUNTAS)]
if not tarefas:
    sys.exit("tarefas.csv ainda não tem linhas preenchidas.")

fichas = {t["participante"] for t in tarefas}
humanos = {p for p in fichas if not p.startswith("P0")}
minimo = math.ceil(META * len(fichas))
print(f"Testes (fichas): {len(fichas)}, sendo {len(humanos)} com participantes e {len(fichas) - len(humanos)} piloto automatizado")
print(f"Meta: pelo menos {minimo} de {len(fichas)} testes com a tarefa concluída sozinha")
print()
print("| Tarefa | Sozinho | Com dica | Não concluiu | Sem registro | Não aplicada | Mediana do tempo (s) | Erros registrados | Meta |")
print("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
por_tarefa = defaultdict(list)
for t in tarefas:
    por_tarefa[t["tarefa"]].append(t)
abaixo = []
for chave in sorted(por_tarefa, key=lambda x: (len(x), x)):
    linhas = por_tarefa[chave]
    c = [norm(l["resultado"]) for l in linhas]
    tempos = [v for l in linhas if not l["participante"].startswith("P0") for v in [numero(l.get("tempo_s", ""))] if v is not None]
    erros = [v for l in linhas if not l["participante"].startswith("P0") for v in [numero(l.get("erros", ""))] if v is not None]
    atingiu = c.count("sim") >= minimo
    if not atingiu:
        abaixo.append(chave)
    mediana = fmt(statistics.median(tempos)) if tempos else "-"
    erros_txt = f"{fmt(sum(erros))} (em {len(erros)} ficha(s))" if erros else "-"
    nome = NOMES.get(chave, "")
    rotulo = f"{chave}. {nome}" if nome else chave
    print(f"| {rotulo} | {c.count('sim')} | {c.count('dica')} | {c.count('nao')} | {c.count('sem')} | {c.count('naoapl')} | {mediana} | {erros_txt} | {'atingida' if atingiu else 'abaixo'} |")
print()
if abaixo:
    print("Tarefas abaixo da meta (viram itens no Jira): " + ", ".join(abaixo))
else:
    print("Todas as tarefas atingiram a meta.")

if notas:
    print()
    print("| Pergunta | Respostas | Média (1 a 5) |")
    print("| --- | --- | --- |")
    for p, texto in PERGUNTAS.items():
        valores = [v for v in (numero(n.get(p, "")) for n in notas) if v is not None]
        if valores:
            print(f"| {texto} | {len(valores)} | {fmt(sum(valores) / len(valores))} |")
