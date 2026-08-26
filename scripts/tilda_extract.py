#!/usr/bin/env python3
"""Извлекает из сохранённой Tilda-страницы машиночитаемый чертёж вёрстки.

Tilda хранит геометрию Zero Block (T396) прямо в data-атрибутах элементов:
координаты, размеры, кегль. Это точный источник правды по иерархии и
пропорциям — по нему собирается своя вёрстка, без копирования абсолютного
позиционирования.

Использование:
    python3 scripts/tilda_extract.py docs/tilda-source/switch-na-go
"""

import json
import re
import sys
from html import unescape
from pathlib import Path

# Типы записей Tilda, которые не несут содержимого: счётчики, cookie-баннер,
# служебные скрипты, отбивки нулевой высоты и дубль меню под мобилку.
# В чертёж не попадают, но перечисляются отдельно.
SLUZHEBNYE_TIPY = {"131", "215", "270", "360", "450", "657", "668"}

# Геометрия базовой (широкой) раскладки и переопределения под брейкпоинты.
POLE = re.compile(r'data-field-([a-z0-9]+)-value="([^"]*)"')
POLE_RES = re.compile(r'data-field-([a-z0-9]+)-res-(\d+)-value="([^"]*)"')
TIP_ELEMENTA = re.compile(r"data-elem-type=['\"]([^'\"]*)['\"]")
TEG = re.compile(r"<[^>]+>")
PROBELY = re.compile(r"\s+")
# Инициализация Tilda живёт в <script> и <style> внутри записи — в текст не идёт.
SKRIPTY = re.compile(r"<(script|style)\b.*?</\1>", re.S | re.I)

# Tilda мешает одинарные и двойные кавычки в атрибутах, поэтому везде ('|").
SSYLKA = re.compile(r"""href=('|")(.*?)\1""")
KARTINKA = re.compile(
    r"""(?:data-original|src)=('|")(https://static\.tildacdn[^'"]*)\1"""
)

# Разметка Zero Block приходит в одинарных кавычках.
NACHALO_ELEMENTA = re.compile(r"""(?=<div class=['"]t396__elem)""")
ARTBOARD = re.compile(r"<div class=['\"]t396__artboard['\"]([^>]*)>")

GEOMETRIYA = (
    ("left", "left"),
    ("top", "top"),
    ("width", "width"),
    ("height", "height"),
    ("fontsize", "razmer_shrifta"),
)


def chislo(znachenie: str):
    """Возвращает число, если строка им является, иначе саму строку."""
    try:
        return float(znachenie)
    except ValueError:
        return znachenie


def tekst(html: str) -> str:
    """Схлопывает HTML-фрагмент в чистую строку."""
    s = SKRIPTY.sub(" ", html)
    s = re.sub(r"<br\s*/?>", " ", s)
    return PROBELY.sub(" ", unescape(TEG.sub("", s))).strip()


def razobrat_element(kusok: str) -> dict:
    """Собирает один элемент Zero Block: геометрия, типографика, содержимое."""
    # Атрибут вида data-field-top-res-320-value матчится и общим шаблоном
    # POLE (как поле «top»), поэтому переопределения вырезаются заранее.
    bez_res = POLE_RES.sub("", kusok)
    polya = dict(POLE.findall(bez_res))

    el = {}
    tip = TIP_ELEMENTA.search(kusok)
    if tip:
        el["tip"] = tip.group(1)

    for imya, klyuch in GEOMETRIYA:
        if polya.get(imya):
            el[klyuch] = chislo(polya[imya])

    # Раскладки под узкие экраны — по одной на брейкпоинт Tilda.
    raskladki: dict[str, dict] = {}
    for imya, razreshenie, znachenie in POLE_RES.findall(kusok):
        klyuch = dict(GEOMETRIYA).get(imya)
        if klyuch and znachenie:
            raskladki.setdefault(razreshenie, {})[klyuch] = chislo(znachenie)
    if raskladki:
        el["raskladki"] = {k: raskladki[k] for k in sorted(raskladki, key=int)}

    ssylka = SSYLKA.search(kusok)
    if ssylka:
        el["ssylka"] = ssylka.group(2)

    kartinka = KARTINKA.search(kusok)
    if kartinka:
        el["kartinka"] = kartinka.group(2)

    soderzhimoe = tekst(kusok)
    if soderzhimoe:
        el["tekst"] = soderzhimoe

    return el


def razobrat_stranicu(html: str) -> dict:
    """Делит страницу на записи Tilda и раскладывает Zero Block по элементам."""
    zagolovok = re.search(r"<title>([^<]*)</title>", html)
    opisanie = re.search(r'name="description" content="([^"]*)"', html)

    # Записи идут подряд: <div id="recNNN" class="r" data-record-type="...">
    granicy = [
        (m.start(), m.group(1), m.group(2))
        for m in re.finditer(r'<div id="(rec\d+)"[^>]*data-record-type="(\d+)"', html)
    ]

    zapisi, sluzhebnye = [], []
    for i, (nachalo, rec_id, tip) in enumerate(granicy):
        konec = granicy[i + 1][0] if i + 1 < len(granicy) else len(html)
        kusok = html[nachalo:konec]

        if tip in SLUZHEBNYE_TIPY:
            sluzhebnye.append({"id": rec_id, "tip": tip})
            continue

        zapis = {"id": rec_id, "tip": tip}

        if tip == "396":
            doska = ARTBOARD.search(kusok)
            if doska:
                vysota = re.search(r'data-artboard-height="([^"]*)"', doska.group(1))
                ekrany = re.search(r'data-artboard-screens="([^"]*)"', doska.group(1))
                if vysota:
                    zapis["vysota"] = chislo(vysota.group(1))
                if ekrany:
                    zapis["brejkpointy"] = ekrany.group(1).split(",")

            elementy = NACHALO_ELEMENTA.split(kusok)[1:]
            razobrannye = [razobrat_element(e) for e in elementy]
            zapis["elementy"] = [e for e in razobrannye if e]
        else:
            soderzhimoe = tekst(kusok)
            if soderzhimoe:
                zapis["tekst"] = soderzhimoe
            zapis["kartinki"] = sorted({m[1] for m in KARTINKA.findall(kusok)})

        zapisi.append(zapis)

    return {
        "zagolovok": zagolovok.group(1).strip() if zagolovok else "",
        "opisanie": opisanie.group(1).strip() if opisanie else "",
        "zapisi": zapisi,
        "sluzhebnye": sluzhebnye,
    }


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)

    katalog = Path(sys.argv[1])
    istochnik = katalog / "page.html"
    if not istochnik.exists():
        sys.exit(f"Нет файла {istochnik}")

    chertezh = razobrat_stranicu(istochnik.read_text(encoding="utf-8"))
    cel = katalog / "chertezh.json"
    cel.write_text(
        json.dumps(chertezh, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )

    soderzhatelnye = len(chertezh["zapisi"])
    elementov = sum(len(z.get("elementy", [])) for z in chertezh["zapisi"])
    print(
        f"{katalog.name}: {soderzhatelnye} записей "
        f"({len(chertezh['sluzhebnye'])} служебных отброшено), "
        f"{elementov} элементов Zero Block → {cel}"
    )


if __name__ == "__main__":
    main()
