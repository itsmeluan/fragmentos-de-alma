#!/usr/bin/env python3
"""Gera o plano de produção dos estados de raridade (plan.json).
Cada estado é um create_character_state a partir do sprite COMUM base."""
import json, os

# COMUM base IDs (do manifest.json) — fonte de cada create_character_state
BASES = {
    ("guardiao", "guardiao"):     "e474e4f5-c58e-4df6-b4e9-33e602986b16",
    ("guardiao", "sentinela"):    "4840473e-fce5-4978-bf61-c83e390b69c2",
    ("destruidor", "fragmentador"): "073350a1-ebf7-472a-9d86-c40e5c795cea",
    ("destruidor", "reaver"):     "4ec2f53c-82fc-4334-a3c9-a682f00ea984",
    ("arauto", "arauto"):         "0a009c7e-0acb-4a1e-8546-255de2fdbaed",
    ("arauto", "corneiro"):       "ebb178b3-f8e8-42d3-b6ee-2a2d5ddc8fbc",
    ("invocador", "invocador"):   "4b34b445-3e14-415a-af59-40a1e45e8e66",
    ("invocador", "anciao"):      "972401a0-b799-4a3e-876f-157be9d29cd2",
    ("trickster", "vidente"):     "25728967-c03a-4bc8-b42c-cff77408f862",
    ("trickster", "cacador"):     "6176572c-cf0d-46c4-bb64-efacf0712bc8",
}

# Builds que JÁ têm lendário (não regerar)
HAS_LENDARIO = {
    ("guardiao", "guardiao"), ("guardiao", "sentinela"),
    ("destruidor", "fragmentador"), ("arauto", "arauto"),
    ("invocador", "invocador"), ("invocador", "anciao"),
    ("trickster", "vidente"), ("trickster", "cacador"),
}

EDITS = {
    "incomum":  "wearing reinforced leather armor with simple metal shoulder accents, a modest upgrade over basic gear, keep the same character and weapon",
    "raro":     "wearing well-crafted iron plate armor with a colored cloak and an improved ornate weapon, keep the same character",
    "epico":    "wearing ornate engraved armor with large pauldrons, a flowing cape and faintly glowing gemstones, keep the same character",
    "lendario": "wearing legendary radiant armor with glowing gold engravings, a divine glowing weapon and majestic ornaments, keep the same character",
}

# Ordem: incomum (todos), raro (todos), epico (todos), depois lendarios faltantes
TIER_ORDER = ["incomum", "raro", "epico", "lendario"]

states = []
for tier in TIER_ORDER:
    for (folder, build), source in BASES.items():
        if tier == "lendario" and (folder, build) in HAS_LENDARIO:
            continue
        states.append({
            "folder": folder, "build": build, "tier": tier,
            "source": source, "edit": EDITS[tier],
            "status": "pending",   # pending -> queued -> done
            "job_id": None,
            "fired_tick": None,
            "attempts": 0,
        })

plan = {"concurrency": 8, "tick": 0, "states": states}
out = os.path.join(os.path.dirname(__file__), "plan.json")
with open(out, "w") as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)

print(f"Plano gerado: {len(states)} estados ({out})")
from collections import Counter
c = Counter(s["tier"] for s in states)
print("Por tier:", dict(c))
