import pytest
import subprocess
from unittest.mock import patch, MagicMock


# Include the function being tested directly in the test file
def get_telemetry_status():
    """Function being tested - included directly in test file"""
    cmd = "dmcli eRT getv Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    # Parse the output to find the value
    for line in result.stdout.splitlines():
        if "value:" in line:
            value = line.split("value:")[-1].strip().lower()
            return value == "true"

    # Return False if no value found or if value is not "true"
    return False


# Unit tests - FIXED: Use correct patch path and include function locally
@patch("subprocess.run")  # Direct patch on subprocess module
def test_telemetry_enabled_true(mock_run):
    mock_run.return_value = MagicMock(
        stdout="param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               "type: bool\n"
               "value: true\n"
    )
    assert get_telemetry_status() == True


@patch("subprocess.run")
def test_telemetry_enabled_false(mock_run):
    mock_run.return_value = MagicMock(
        stdout="param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               "type: bool\n"
               "value: false\n"
    )
    assert get_telemetry_status() == False


@patch("subprocess.run")
def test_telemetry_no_value_line(mock_run):
    mock_run.return_value = MagicMock(
        stdout="param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               "type: bool\n"
    )
    assert get_telemetry_status() == False


@patch("subprocess.run")
def test_telemetry_output_unexpected_format(mock_run):
    mock_run.return_value = MagicMock(
        stdout="unexpected output format with no value field"
    )
    assert get_telemetry_status() == False


@patch("subprocess.run")
def test_telemetry_empty_output(mock_run):
    """Test case for completely empty output"""
    mock_run.return_value = MagicMock(
        stdout=""
    )
    assert get_telemetry_status() == False


@patch("subprocess.run")
def test_telemetry_case_insensitive_true(mock_run):
    """Test case for case insensitive 'True' value"""
    mock_run.return_value = MagicMock(
        stdout="value: True\n"
    )
    assert get_telemetry_status() == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])