import json
import pathlib
import sys
import zipfile

cmd = sys.argv[1]
zip_path = sys.argv[2]

with zipfile.ZipFile(zip_path) as zf:
    if cmd == "list":
        print(json.dumps(zf.namelist()))
    elif cmd == "extract":
        entry = sys.argv[3]
        dest = pathlib.Path(sys.argv[4])
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(zf.read(entry))
    else:
        raise SystemExit(f"unknown cmd {cmd}")
