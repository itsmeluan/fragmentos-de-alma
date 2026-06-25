#!/usr/bin/env python3
"""Gera bosses_plan.json — 7 chefes × 3 fases = 21 sprites."""
import json, os

HERE = os.path.dirname(__file__)

# 7 Fragmentos Antigos — um por território/facção (Doc 07)
BOSSES = [
    {
        "key": "axis_velum",
        "name": "Velum, o Arquiteto",
        "territory": "Axis",
        "faction": "Arquitetos do Véu",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "tall sorcerer in flowing dark robes covered in geometric rune patterns, "
                    "wearing a mask that splits reality around it, staff topped with a crystal sphere, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same sorcerer but robe is torn and glowing cracks appear on the mask, "
                    "the crystal sphere floats and pulses with unstable energy, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: the mask has shattered revealing a void beneath, "
                    "robes are disintegrating into void energy, staff broken but reality warps around the character, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "kethara_lithos",
        "name": "Lithos, a Pedra Viva",
        "territory": "Kethara",
        "faction": "Pedra Viva",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "massive stone golem knight with living crystal growths on the armor, "
                    "glowing amber eyes, great hammer made of raw stone, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same stone golem but armor cracked revealing molten core beneath, "
                    "crystal growths larger and glowing brighter, hammer now pulses with earth energy, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: the stone shell has partially exploded revealing a being of pure molten crystal, "
                    "the form is unstable and partially floating, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "mnemos_echonis",
        "name": "Echonis, o Sussurro",
        "territory": "Mnemos",
        "faction": "Véu dos Ecos",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "ethereal wraith-like figure in silver robes that flow like memories, "
                    "face partially obscured by a silver veil, holding a mirror that shows different timelines, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same figure but the veil is torn showing a distorted face of echoed memories, "
                    "the mirror now shows a cracked reflection, silver robes now have ghostly faces embedded, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: the figure splits into multiple overlapping echoes of itself, "
                    "the mirror is shattered and pieces orbit around, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "verdania_floris",
        "name": "Floris, o Perpétuo",
        "territory": "Verdânia",
        "faction": "Jardim Perpétuo",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "ancient druid with bark-like skin and flowering vines growing from the body, "
                    "crown of thorns and blooming flowers, staff made of a living twisted tree branch, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same druid but bark is cracking and dark corruption spreads on the vines, "
                    "flowers are wilting, staff now has thorns and dead leaves, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: fully corrupted — bark turns black and twisted, "
                    "crown of dead thorns drips dark sap, vines are writhing tendrils, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "cinderfall_ignis",
        "name": "Ignis, a Chama Negra",
        "territory": "Cinderfall",
        "faction": "Chama Negra",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "fire warrior in charred obsidian armor with black flames emanating from the body, "
                    "dual curved blades that are permanently on fire with dark flames, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same warrior but armor is melting into the dark flames, "
                    "blades now fused to the hands, fire more intense and spreading further, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: fully transformed into a being of black fire barely contained in humanoid shape, "
                    "the obsidian armor fragments orbit around the fire form, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "limiar_umbra",
        "name": "Umbra, o Limiar",
        "territory": "Limiar",
        "faction": "Confraria do Limiar",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "mysterious figure cloaked in shadow that blends into the background, "
                    "only silver eyes visible beneath the hood, dual shadow daggers, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same figure but the cloak is peeling away to reveal void beneath, "
                    "shadow daggers now leave trails of darkness, silver eyes now glow intensely, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: the cloak is gone and the figure is pure void given humanoid form, "
                    "shadow daggers have become extensions of the void body, "
                    "keep same character"
                ),
            },
        ],
    },
    {
        "key": "venula_cruor",
        "name": "Cruor, o Carmesim",
        "territory": "Vênula",
        "faction": "Ordem Carmesim",
        "phases": [
            {
                "phase": 1,
                "description": (
                    "blood knight in crimson plate armor with living veins pulsing across it, "
                    "great sword dripping with crimson energy, horned helmet, "
                    "64px pixel art, black outline, side view, high detail"
                ),
            },
            {
                "phase": 2,
                "description": (
                    "same knight but armor is cracking and crimson energy bleeds through the cracks, "
                    "sword now pulsing with heartbeat rhythm, veins on armor more prominent, "
                    "keep same character and proportions"
                ),
            },
            {
                "phase": 3,
                "description": (
                    "final phase: armor is shattered and the knight is revealed as a being of pure crimson energy, "
                    "the sword has become a wave of blood energy, horns intact but rest is raw power, "
                    "keep same character"
                ),
            },
        ],
    },
]

# Enriquecer com metadados de status
plan_bosses = []
for b in BOSSES:
    phases = []
    for i, ph in enumerate(b["phases"]):
        entry = {
            "phase": ph["phase"],
            "description": ph["description"],
            "source": None,
            "job_id": None,
            "status": "pending" if ph["phase"] == 1 else "waiting_source",
            "fired_tick": None,
            "attempts": 0,
        }
        phases.append(entry)
    plan_bosses.append({"key": b["key"], "name": b["name"],
                        "territory": b["territory"], "faction": b["faction"],
                        "phases": phases})

plan = {"concurrency": 8, "tick": 0, "bosses": plan_bosses}
out = os.path.join(HERE, "bosses_plan.json")
with open(out, "w") as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)

total = sum(len(b["phases"]) for b in plan_bosses)
print(f"Plano de chefes gerado: {len(plan_bosses)} chefes, {total} fases")
for b in plan_bosses:
    print(f"  {b['key']} ({b['territory']})")
