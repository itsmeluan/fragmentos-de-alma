#!/usr/bin/env python3
"""Orquestrador de produção de inimigos corrompidos (enemies_plan.json).

Subcomandos:
  poll           baixa estados 'queued' prontos; marca 'done'.
  next <n>       imprime até n estados 'pending'.
  record F B ID  grava job_id e marca 'queued'.
  status         resumo (exit 0 se all_done).
"""
import json, os, sys, subprocess

HERE = os.path.dirname(__file__)
PLAN = os.path.join(HERE, "enemies_plan.json")
APP_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SPRITES_ROOT = os.path.join(APP_ROOT, "assets", "sprites", "enemies")
CDN = "https://backblaze.pixellab.ai/file/pixellab-characters/54c55eb2-f0d1-41f4-9ef9-976ea3f3c1dc"
DIRS = ["south", "east", "north", "west", "south-east", "north-east", "north-west", "south-west"]
STALE_TICKS = 6
MAX_ATTEMPTS = 3


def load():
    with open(PLAN) as f: return json.load(f)

def save(p):
    with open(PLAN, "w") as f: json.dump(p, f, ensure_ascii=False, indent=2)

def try_download(job_id, folder, build):
    outdir = os.path.join(SPRITES_ROOT, folder, build)
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
    for s in p["states"]:
        if s["status"] != "queued" or not s["job_id"]: continue
        if try_download(s["job_id"], s["folder"], s["build"]):
            s["status"] = "done"
            downloaded.append(f"{s['folder']}/{s['build']}")
        else:
            waited = tick - (s["fired_tick"] or tick)
            if waited >= STALE_TICKS:
                if s["attempts"] >= MAX_ATTEMPTS: s["status"] = "failed"
                else:
                    s["status"] = "pending"
                    s["job_id"] = None
    save(p)
    print(json.dumps({"tick": tick, "downloaded": downloaded}, ensure_ascii=False))

def cmd_next(p, n):
    queued = sum(1 for s in p["states"] if s["status"] == "queued")
    free = max(0, p["concurrency"] - queued)
    take = min(free, n)
    out = []
    for s in p["states"]:
        if len(out) >= take: break
        if s["status"] == "pending":
            out.append({"folder": s["folder"], "build": s["build"],
                        "source": s["source"], "edit": s["edit"]})
    print(json.dumps({"free": free, "fire": out}, ensure_ascii=False))

def cmd_record(p, folder, build, job_id):
    for s in p["states"]:
        if s["folder"] == folder and s["build"] == build:
            s["status"] = "queued"
            s["job_id"] = job_id
            s["fired_tick"] = p["tick"]
            s["attempts"] = s.get("attempts", 0) + 1
            save(p)
            print(f"record OK: {folder}/{build} <- {job_id}")
            return
    print(f"record FALHOU: {folder}/{build}", file=sys.stderr)
    sys.exit(1)

def cmd_status(p):
    from collections import Counter
    c = Counter(s["status"] for s in p["states"])
    total = len(p["states"])
    done = c.get("done", 0)
    print(json.dumps({"total": total, **dict(c),
                      "all_done": done + c.get("failed", 0) == total}, ensure_ascii=False))
    sys.exit(0 if (c.get("pending", 0) == 0 and c.get("queued", 0) == 0) else 2)

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
