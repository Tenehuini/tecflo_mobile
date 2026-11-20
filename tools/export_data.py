"""Exporta los datos de tecflo (base SQLite + datos fijos en Python) a data.js.

La app para celulares no tiene servidor: todo lo que muestra sale de data.js.
Correr este script cada vez que cambien los datos en tecflo y publicar.

Uso:
    python3 tools/export_data.py [ruta/a/tecflo/backend]

Por defecto busca el backend en ../tecflo/backend (al lado de este repo).
Solo usa la biblioteca estándar: no hace falta el venv de tecflo.
"""

import json
import sqlite3
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / "tecflo" / "backend"
OUT = ROOT / "data.js"

sys.dont_write_bytecode = True  # no dejar __pycache__ dentro de tecflo
sys.path.insert(0, str(BACKEND))
from app.data.farmacias import FARMACIAS, TURNOS  # noqa: E402
from app.data.info_util import INFO_UTIL, TELEFONOS_UTILES  # noqa: E402
from app.data.menu import MENU  # noqa: E402


def rows(db: sqlite3.Connection, sql: str) -> list[dict]:
    return [dict(r) for r in db.execute(sql)]


def main() -> None:
    db = sqlite3.connect(BACKEND / "tecflo.db")
    db.row_factory = sqlite3.Row

    data = {
        "generated": date.today().isoformat(),
        "menu": MENU,
        # Mismo orden e ids que el backend (posición en FARMACIAS, desde 1).
        "farmacias": [
            {"id": i + 1, "name": str(name), **info}
            for i, (name, info) in enumerate(FARMACIAS.items())
        ],
        "turnos": {str(day): str(name) for day, name in TURNOS.items()},
        "infoUtil": {"telefonos": TELEFONOS_UTILES, "servicios": INFO_UTIL},
        "eventos": rows(db, "SELECT id, name, description, date, lugar, latitude, longitude FROM eventos ORDER BY date"),
        "equipos": rows(db, "SELECT id, deporte_torneo_id, categoria_id, name, logo FROM deportes_equipos ORDER BY name"),
        "jugadores": rows(db, "SELECT id, deporte_equipo_id, name, date_of_birth, photo FROM deportes_jugadores ORDER BY name"),
        "partidos": rows(db, "SELECT id, torneo_id, categoria_id, home_equipo_id, away_equipo_id, scheduled_at, place, home_score, away_score FROM deportes_partidos ORDER BY scheduled_at"),
        "goles": rows(db, "SELECT id, partido_id, jugador_id, equipo_id, minute FROM deportes_goles"),
    }

    body = json.dumps(data, ensure_ascii=False, indent=1)
    OUT.write_text(
        "'use strict';\n\n"
        "// ARCHIVO GENERADO por tools/export_data.py: no editar a mano.\n"
        f"const DATA = {body};\n",
        encoding="utf-8",
    )
    counts = {k: len(v) for k, v in data.items() if isinstance(v, list)}
    print(f"data.js escrito desde {BACKEND}: {counts}")


if __name__ == "__main__":
    main()
