"""Calcula os resultados do teste de usabilidade com estudantes a partir das planilhas CSV preenchidas.

Uso:
    python testes/analisar_usabilidade.py [pasta_com_os_csv]

Arquivos lidos (modelos em docs/teste-usabilidade/):
    tarefas.csv  : participante, dispositivo, tarefa, resultado (sim | com dica | nao), tempo_s, erros, observacao
    notas.csv    : participante, p1, p2, p3, p4, p5 (nota de 1 a 5; p5 só para quem usou o celular)
A saída é um texto pronto para colar na seção 6 do documento (taxa de sucesso por tarefa, tempo médio,
erros e média das notas). A meta definida no roteiro é: pelo menos 80% dos participantes concluem sozinhos.
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

PASTA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "docs" / "teste-usabilidade"
NOMES = {
    "1": "Descobrir o prazo de matrícula de Engenharia da Computação",
    "2": "Ver os avisos urgentes",
    "3": "Criar conta, salvar Psicologia e conferir no perfil",
    "4": "Enviar uma sugestão para a equipe",
    "5": "Abrir a lista de cursos no celular",
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


tarefas = [t for t in ler("tarefas.csv") if t.get("resultado")]
notas = [n for n in ler("notas.csv") if any(n.get(p) for p in PERGUNTAS)]

if not tarefas:
    sys.exit("tarefas.csv ainda não tem linhas preenchidas.")

participantes = {t["participante"] for t in tarefas}
print(f"Participantes: {len(participantes)}")
print()
print("| Tarefa | Participantes | Sozinhos | Com dica | Não concluíram | Taxa de sucesso sozinho | Tempo médio (s) | Erros (média) |")
print("| --- | --- | --- | --- | --- | --- | --- | --- |")
por_tarefa = defaultdict(list)
for t in tarefas:
    por_tarefa[t["tarefa"]].append(t)
abaixo_da_meta = []
for chave in sorted(por_tarefa, key=lambda x: (len(x), x)):
    linhas = por_tarefa[chave]
    res = [l["resultado"].lower().replace("não", "nao") for l in linhas]
    sim, dica, nao = res.count("sim"), res.count("com dica"), res.count("nao")
    tempos = [v for v in (numero(l.get("tempo_s", "")) for l in linhas) if v is not None]
    erros = [v for v in (numero(l.get("erros", "")) for l in linhas) if v is not None]
    taxa = 100 * sim / len(linhas)
    if taxa < 80:
        abaixo_da_meta.append(chave)
    nome = NOMES.get(chave, "")
    rotulo = f"{chave}. {nome}" if nome else chave
    tempo_medio = f"{sum(tempos) / len(tempos):.0f}" if tempos else "-"
    erros_medios = f"{sum(erros) / len(erros):.1f}" if erros else "-"
    print(f"| {rotulo} | {len(linhas)} | {sim} | {dica} | {nao} | {taxa:.0f}% | {tempo_medio} | {erros_medios} |")
print()
if abaixo_da_meta:
    print("Tarefas abaixo da meta de 80% (viram itens no Jira): " + ", ".join(abaixo_da_meta))
else:
    print("Todas as tarefas atingiram a meta de 80% de conclusão sem ajuda.")

if notas:
    print()
    print("| Pergunta | Respostas | Média (1 a 5) |")
    print("| --- | --- | --- |")
    for p, texto in PERGUNTAS.items():
        valores = [v for v in (numero(n.get(p, "")) for n in notas) if v is not None]
        if valores:
            print(f"| {texto} | {len(valores)} | {sum(valores) / len(valores):.1f} |")
