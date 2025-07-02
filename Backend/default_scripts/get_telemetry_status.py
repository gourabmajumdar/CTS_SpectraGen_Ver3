# telemetry.py

import subprocess

def get_telemetry_status():
    """
    Prints the full dmcli output and returns the status of telemetry reporting on the device.
    Returns:
        bool: True if telemetry reporting is enabled, False otherwise.
    """
    cmd = "dmcli eRT getv Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable"
    result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE)
    output = result.stdout.decode("utf-8")

    print("dmcli output:\n" + output)

    # Look for line that contains 'value:'
    for line in output.splitlines():
        if "value:" in line:
            value = line.split("value:")[-1].strip().lower()
            return value == "true"
    return False

if __name__ == "__main__":
    telemetry_enabled = get_telemetry_status()
    print(f"Telemetry Enabled: {telemetry_enabled}")
