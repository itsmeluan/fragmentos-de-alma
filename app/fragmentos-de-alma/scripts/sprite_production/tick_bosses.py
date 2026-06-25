#!/usr/bin/env python3
"""Orquestrador de produção de chefes (bosses_plan.json).

Cada chefe tem 3 fases.
- Fase 1: gerada por create_character (sem source).
- Fase 2 e 3: create_character_state do job_id da fase anterior.

Subcomandos:
  poll           baixa estados 'queued' prontos; marca 'done'. Propaga phase1_id p/ fase 2.
  next <n>       imprime até n estados prontos para disparar (pending + fase anterior done).
  record B PH ID grava job_id.
  status         resumo (exit 0 se all_done).
"""
import json, os, sys, subprocess

HERE = os.path.dirname(__file__)
PLAN = os.path.join(HERE, "bosses_plan.json")
APP_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SPRITES_ROOT = os.path.join(APP_ROOT, "assets", "sprites", "bosses")
CDN = "https://backblaze.pixellab.ai/file/pixellab-characters/54c55eb2-f0d1-41f4-9ef9-976ea3f3c1dc"
DIRS = ["south", "east", "north", "west", "south-east", "north-east", "north-west", "south-west"]
STALE_TICKS = 8
MAX_ATTEMPTS = 3


def load():
    with open(PLAN) as f: return json.load(f)

def save(p):
    with open(PLAN, "w") as f: json.dump(p, f, ensure_ascii=False, indent=2)

def try_download(job_id, boss_key, phase):
    outdir = os.path.join(SPRITES_ROOT, boss_key, f"fase{phase}")
    os.makedirs(outdir, exist_ok=True)
    tmp = {}
    for d in DIRS:
        url = f"{CDN}/{job_id}/rotations/{d}.png"
        dest = os.path.join(outdir, d + ".png")
        r = subprocess.run(["curl", "-fsS", url, "-o", dest], capture_output=True)
        if r.returncode != 0 or not os.path.exists(dest) or os.path.getsize(dest) < 200:
            if os.path.exists(dest): os.remove(dest)
            return False
        with open(dest, "rb") as fh:
            if fh.read(8) != b"\x89PNG\r\n\x1a\n":
                os.remove(dest)
                return False
        tmp[d] = dest
    return len(tmp) == 8

def cmd_poll(p):
    tick = p["tick"] + 1
    p["tick"] = tick
    downloaded = []
    for boss in p["bosses"]:
        key = boss["key"]
        for ph in boss["phases"]:
            phase = ph["phase"]
            if ph["status"] != "queued" or not ph.get("job_id"): continue
            if try_download(ph["job_id"], key, phase):
                ph["status"] = "done"
                downloaded.append(f"{key}/fase{phase}")
                # propaga job_id como source para próxima fase
                next_ph = next((x for x in boss["phases"] if x["phase"] == phase + 1), None)
                if next_ph and next_ph["status"] == "waiting_source":
                    next_ph["source"] = ph["job_id"]
                    next_ph["status"] = "pending"
            else:
                waited = tick - (ph.get("fired_tick") or tick)
                if waited >= STALE_TICKS:
                    if ph.get("attempts", 0) >= MAX_ATTEMPTS: ph["status"] = "failed"
                    else:
                        ph["status"] = "pending" if phase == 1 else "waiting_source"
                        ph["job_id"] = None
    save(p)
    print(json.dumps({"tick": tick, "downloaded": downloaded}, ensure_ascii=False))

def cmd_next(p, n):
    queued = sum(ph["status"] == "queued"
                 for boss in p["bosses"] for ph in boss["phases"])
    free = max(0, p["concurrency"] - queued)
    take = min(free, n)
    out = []
    for boss in p["bosses"]:
        if len(out) >= take: break
        for ph in boss["phases"]:
            if len(out) >= take: break
            if ph["status"] == "pending":
                item = {"boss": boss["key"], "phase": ph["phase"],
                        "description": ph["description"]}
                if ph.get("source"):
                    item["source"] = ph["source"]   # → create_character_state
                # sem source → create_character
                out.append(item)
    print(json.dumps({"free": free, "fire": out}, ensure_ascii=False))

def cmd_record(p, boss_key, phase_str, job_id):
    phase = int(phase_str)
    for boss in p["bosses"]:
        if boss["key"] != boss_key: continue
        for ph in boss["phases"]:
            if ph["phase"] == phase:
                ph["status"] = "queued"
                ph["job_id"] = job_id
                ph["fired_tick"] = p["tick"]
                ph["attempts"] = ph.get("attempts", 0) + 1
                save(p)
                print(f"record OK: {boss_key}/fase{phase} <- {job_id}")
                return
    print(f"record FALHOU: {boss_key}/fase{phase}", file=sys.stderr)
    sys.exit(1)

def cmd_status(p):
    from collections import Counter
    counts = Counter()
    total = 0
    for boss in p["bosses"]:
        for ph in boss["phases"]:
            counts[ph["status"]] += 1
            total += 1
    done = counts.get("done", 0)
    all_done = (counts.get("pending", 0) + counts.get("queued", 0) + counts.get("waiting_source", 0)) == 0
    print(json.dumps({"total": total, **dict(counts), "all_done": all_done}, ensure_ascii=False))
    sys.exit(0 if all_done else 2)

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    p = load()
    if cmd == "poll": cmd_poll(p)
    elif cmd == "next": cmd_next(p, int(sys.argv[2]) if len(sys.argv) > 2 else 8)
    elif cmd == "record": cmd_record(p, sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "status": cmd_status(p)
    else: print(f"comando desconhecido: {cmd}", file=sys.stderr); sys.exit(1)

if __name__ == "__main__":
    main()
