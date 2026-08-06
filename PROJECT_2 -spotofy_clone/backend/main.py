import os
import sys
import subprocess
import uvicorn

def free_port(port):
    try:
        if sys.platform == "win32":
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True, text=True)
            for line in output.strip().splitlines():
                if "LISTENING" in line:
                    parts = line.split()
                    pid = parts[-1]
                    if pid and pid != str(os.getpid()):
                        print(f"[INFO] Freeing port {port} (terminating stale PID {pid})...")
                        subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    free_port(port)
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)