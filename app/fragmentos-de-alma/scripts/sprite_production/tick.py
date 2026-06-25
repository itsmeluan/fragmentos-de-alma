#!/usr/bin/env python3
"""Orquestrador de um ciclo da produção de sprites de raridade.

Subcomandos:
  poll            baixa estados 'queued' que ficaram prontos, marca 'done'.
                  re-disponibiliza (status->pending) jobs presos há muitos ticks.
  next <n>        imprime (JSON) até n estados 'pending' para disparar.
  record F B T ID grava job_id num estado e marca 'queued'.
  status          resumo done/queued/pending (+ exit code 0 se tudo done).

O download usa o padrão público do CDN PixelLab; um estado só vira 'done'
quando as 8 direções baixam como PNG válido.
"""
import json, os, sys, subprocess

HERE = os.path.dirname(__file__)
PLAN = os.path.join(HERE, "plan.json")
# raiz do app (scripts/sprite_production -> app/fragmentos-de-alma)
APP_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SPRITES_ROOT = os.path.join(APP_ROOT, "assets", "sprites", "heroes")
CDN = "https://backblaze.pixellab.ai/file/pixellab-characters/54c55eb2-f0d1-41f4-9ef9-976ea3f3c1dc"
DIRS = ["south", "east", "north", "west", "south-east", "north-east", "north-west", "south-west"]
STALE_TICKS = 6   # re-dispara um 'queued' que não baixou após N ticks
MAX_ATTEMPTS = 3  # desiste de um estado após N tentativas


def load():
    with open(PLAN) as f:
        return json.load(f)


def save(p):
    with open(PLAN, "w") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)


def try_download(job_id, folder, build, tier):
    """Baixa as 8 direções; retorna True só se todas forem PNG válido."""
    outdir = os.path.join(SPRITES_ROOT, folder, build, tier)
    os.makedirs(outdir, exist_ok=True)
    tmp = {}
    for d in DIRS:
        url = f"{CDN}/{job_id}/rotations/{d}.png"
        dest = os.path.join(outdir, d + ".png")
        r = subprocess.run(["curl", "-fsS", url, "-o", dest],
                           capture_output=True)
        if r.returncode != 0 or not os.path.exists(dest) or os.path.getsize(dest) < 200:
            # falhou — remove parcial para não deixar lixo
            if os.path.exists(dest):
                os.remove(dest)
            return False
        # valida assinatura PNG
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
        if s["status"] != "queued" or not s["job_id"]:
            continue
        if try_download(s["job_id"], s["folder"], s["build"], s["tier"]):
            s["status"] = "done"
            downloaded.append(f"{s['folder']}/{s['build']}/{s['tier']}")
        else:
            waited = tick - (s["fired_tick"] or tick)
            if waited >= STALE_TICKS:
                if s["attempts"] >= MAX_ATTEMPTS:
                    s["status"] = "failed"
                else:
                    s["status"] = "pending"  # re-dispara no próximo next
                    s["job_id"] = None
    save(p)
    print(json.dumps({"tick": tick, "downloaded": downloaded}, ensure_ascii=False))


def cmd_next(p, n):
    queued = sum(1 for s in p["states"] if s["status"] == "queued")
    free = max(0, p["concurrency"] - queued)
    take = min(free, n)
    out = []
    for s in p["states"]:
        if len(out) >= take:
            break
        if s["status"] == "pending":
            out.append({"folder": s["folder"], "build": s["build"],
                        "tier": s["tier"], "source": s["source"], "edit": s["edit"]})
    print(json.dumps({"free": free, "fire": out}, ensure_ascii=False))


def cmd_record(p, folder, build, tier, job_id):
    for s in p["states"]:
        if s["folder"] == folder and s["build"] == build and s["tier"] == tier:
            s["status"] = "queued"
            s["job_id"] = job_id
            s["fired_tick"] = p["tick"]
            s["attempts"] = s.get("attempts", 0) + 1
            save(p)
            print(f"record OK: {folder}/{build}/{tier} <- {job_id}")
            return
    print(f"record FALHOU: estado não encontrado {folder}/{build}/{tier}", file=sys.stderr)
    sys.exit(1)


def cmd_status(p):
    from collections import Counter
    c = Counter(s["status"] for s in p["states"])
    summary = dict(c)
    total = len(p["states"])
    done = c.get("done", 0)
    print(json.dumps({"total": total, **summary,
                      "all_done": done + c.get("failed", 0) == total}, ensure_ascii=False))
    # exit 0 se nada mais a fazer
    sys.exit(0 if (c.get("pending", 0) == 0 and c.get("queued", 0) == 0) else 2)


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    p = load()
    if cmd == "poll":
        cmd_poll(p)
    elif cmd == "next":
        cmd_next(p, int(sys.argv[2]) if len(sys.argv) > 2 else 8)
    elif cmd == "record":
        cmd_record(p, sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    elif cmd == "status":
        cmd_status(p)
    else:
        print(f"comando desconhecido: {cmd}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
