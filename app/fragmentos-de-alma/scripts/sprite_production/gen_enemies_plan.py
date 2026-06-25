#!/usr/bin/env python3
"""Gera plano de produção de inimigos corrompidos e chefes (enemies_plan.json).

Inimigos (10): variantes corrompidas das 5 bases de núcleo (base + elite).
Chefes (21): 7 Fragmentos Antigos × 3 fases cada.
  - Fase 1: gerado do zero via create_character (boss_plan.json separado).
  - Fase 2 e 3: create_character_state da fase anterior.

Este script gera apenas o plano de inimigos (10 estados via create_character_state).
"""
import json, os

HERE = os.path.dirname(__file__)

# Bases de núcleo (um representante por núcleo — usamos o build principal)
BASES = {
    "guardiao":   "e474e4f5-c58e-4df6-b4e9-33e602986b16",
    "destruidor": "073350a1-ebf7-472a-9d86-c40e5c795cea",
    "arauto":     "0a009c7e-0acb-4a1e-8546-255de2fdbaed",
    "invocador":  "4b34b445-3e14-415a-af59-40a1e45e8e66",
    "trickster":  "25728967-c03a-4bc8-b42c-cff77408f862",
}

EDITS = {
    "corrompido": (
        "corrupted version: body is cracked and leaking dark void energy, "
        "eyes glow with corrupt purple light, armor is shattered and covered in dark crystal growths, "
        "keep same silhouette and proportions"
    ),
    "elite": (
        "powerful elite corrupted version: body is heavily fractured with large dark crystal spikes erupting from the armor, "
        "surrounded by a menacing dark aura, glowing void runes on the body, "
        "keep same silhouette and proportions but appear more threatening"
    ),
}

states = []
for nucleus, source in BASES.items():
    for variant in ["corrompido", "elite"]:
        states.append({
            "folder": nucleus,
            "build": variant,
            "source": source,
            "edit": EDITS[variant],
            "status": "pending",
            "job_id": None,
            "fired_tick": None,
            "attempts": 0,
        })

plan = {"concurrency": 8, "tick": 0, "states": states}
out = os.path.join(HERE, "enemies_plan.json")
with open(out, "w") as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)

print(f"Plano de inimigos gerado: {len(states)} estados")
for s in states:
    print(f"  {s['folder']}/{s['build']}")
