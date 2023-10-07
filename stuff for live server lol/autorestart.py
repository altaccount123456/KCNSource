import subprocess
import time

interval = 24 * 60 * 60

directory = "/opt/icecast-server/conf"



while True:
    icecast_result = subprocess.run(["pidof", "icecast"], stdout=subprocess.PIPE, text=True)
    icecast_pid = icecast_result.stdout.strip()  # Remove any leading/trailing whitespace

    if icecast_pid:
        kill_result = subprocess.run(["kill", icecast_pid])

        if kill_result.returncode == 0:
            print(f"Killed icecast process with PID {icecast_pid}")
        else:
            print(f"Failed to kill icecast process with PID {icecast_pid}")

    else:
        print("icecast process is not running")
    
    time.sleep(1.5)

    commands = f"cd {directory} && icecast  -b -c icecast.xml "

    icecast_run_process = subprocess.run(commands, shell=True)

    icecast_new_pid = subprocess.run(["pidof", "icecast"], stdout=subprocess.PIPE, text=True)

    icecast_new_pid = icecast_new_pid.stdout.strip()

    if icecast_run_process.returncode == 0:
        print(f"Started icecast process with PID {icecast_new_pid}")
    else:
        print(f"Failed to start icecast process with PID {icecast_new_pid}")


    time.sleep(interval)