# ♻️ AI OLLAMA MODEL GENERATED CODE UNIT TEST CODE
# Filename: Backend/default_scripts/check_device_mode_test.py
# ========================================================================

import pytest
import subprocess
from unittest.mock import patch, MagicMock

# Include the function being tested directly in the test file
def get_device_mode():
    """Function being tested - included directly in test file"""
    cmd = "dmcli eRT getv Device.X_CISCO_COM_DeviceControl.DeviceMode"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    # Print the full dmcli output and return code
    print("dmcli output:\n" + result.stdout)
    print(f"Return code: {result.returncode}")

    for line in result.stdout.splitlines():
        if "value:" in line:
            return line.split("value:")[-1].strip()
    raise ValueError("Device mode not found in command output")

# Unit tests
@patch("subprocess.run")  # Updated patch path
def test_device_mode_dualstack(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="param: Device.X_CISCO_COM_DeviceControl.DeviceMode\n"
               "type: string\n"
               "value: DualStack\n"
    )
    assert get_device_mode().lower() == "dualstack"

@patch("subprocess.run")  # Updated patch path
def test_device_mode_ipv4(mock_run):
    mock_run.return_value = MagicMock(
        returncode=1,
        stdout="value: IPv4\n"
    )
    assert get_device_mode().lower() == "ipv4"

@patch("subprocess.run") # Updated patch path
def test_device_mode_ipv6(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="value: IPv6\n"
    )
    assert get_device_mode().lower() == "ipv6"

@patch("subprocess.run")  # Updated patch path
def test_device_mode_not_found(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="type: string\nparam: something_else\n"
    )
    with pytest.raises(ValueError, match="Device mode not found"):
        get_device_mode()

@patch("subprocess.run")  # Updated patch path
def test_device_mode_empty_output(mock_run):
    """Test case for empty output"""
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout=""
    )
    with pytest.raises(ValueError, match="Device mode not found"):
        get_device_mode()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])