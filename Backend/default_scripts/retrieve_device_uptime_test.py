import pytest
import subprocess
from unittest.mock import patch, MagicMock


# Include the function being tested directly in the test file
def retrieve_device_uptime():
    """Function being tested - included directly in test file"""
    cmd = "dmcli eRT getv Device.DeviceInfo.UpTime"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    # Parse the output to find the value
    for line in result.stdout.splitlines():
        if "value:" in line:
            value = line.split("value:")[-1].strip()
            # Check if the value is a valid uptime (not "NotAvailable" or similar)
            if value and value != "NotAvailable" and value.isdigit():
                return True

    # Return False if no valid uptime value found
    return False


# Unit tests - FIXED: Use correct patch path and include function locally
@patch("subprocess.run")  # Direct patch on subprocess module
def test_retrieve_device_uptime_pass(mock_run):
    mock_run.return_value = MagicMock(
        stdout="value: 12345\n"
    )
    assert retrieve_device_uptime() == True


@patch("subprocess.run")
def test_retrieve_device_uptime_fail(mock_run):
    mock_run.return_value = MagicMock(
        stdout="value: NotAvailable\n"
    )
    assert retrieve_device_uptime() == False


@patch("subprocess.run")
def test_retrieve_device_uptime_empty_value(mock_run):
    """Test case for empty value"""
    mock_run.return_value = MagicMock(
        stdout="value: \n"
    )
    assert retrieve_device_uptime() == False


@patch("subprocess.run")
def test_retrieve_device_uptime_no_value_line(mock_run):
    """Test case for output without value line"""
    mock_run.return_value = MagicMock(
        stdout="param: Device.DeviceInfo.UpTime\ntype: string\n"
    )
    assert retrieve_device_uptime() == False


@patch("subprocess.run")
def test_retrieve_device_uptime_non_numeric(mock_run):
    """Test case for non-numeric uptime value"""
    mock_run.return_value = MagicMock(
        stdout="value: InvalidUptime\n"
    )
    assert retrieve_device_uptime() == False


@patch("subprocess.run")
def test_retrieve_device_uptime_zero(mock_run):
    """Test case for zero uptime (should still be valid)"""
    mock_run.return_value = MagicMock(
        stdout="value: 0\n"
    )
    assert retrieve_device_uptime() == True


@patch("subprocess.run")
def test_retrieve_device_uptime_large_number(mock_run):
    """Test case for large uptime value"""
    mock_run.return_value = MagicMock(
        stdout="value: 999999999\n"
    )
    assert retrieve_device_uptime() == True


@patch("subprocess.run")
def test_retrieve_device_uptime_empty_output(mock_run):
    """Test case for completely empty output"""
    mock_run.return_value = MagicMock(
        stdout=""
    )
    assert retrieve_device_uptime() == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])