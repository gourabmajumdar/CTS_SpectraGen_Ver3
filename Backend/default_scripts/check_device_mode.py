import subprocess

def get_device_mode():
    cmd = "dmcli eRT getv Device.X_CISCO_COM_DeviceControl.DeviceMode"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    # Print the full dmcli output and return code
    print("dmcli output:\n" + result.stdout)
    print(f"Return code: {result.returncode}")

    
    for line in result.stdout.splitlines():
        if "value:" in line:
            return line.split("value:")[-1].strip()
    raise ValueError("Device mode not found in command output")

def test_device_mode():
    expected_modes = {"dualstack", "ipv4", "ipv6"}
    mode = get_device_mode().lower()
    print(f"Device mode returned: {mode}")
    assert mode in expected_modes, f"Unexpected device mode: {mode}"

if __name__ == "__main__":
    try:
        test_device_mode()
        print("Test Passed: Device mode is valid.")
    except AssertionError as e:
        print(f"Test Failed: {e}")
    except Exception as e:
        print(f"Test Failed with error: {e}")
