import pytest
from unittest.mock import patch, MagicMock
from device_mode import get_device_mode

@patch("device_mode.subprocess.run")
def test_device_mode_dualstack(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="param: Device.X_CISCO_COM_DeviceControl.DeviceMode\n"
               "type: string\n"
               "value: DualStack\n"
    )
    assert get_device_mode().lower() == "dualstack"

@patch("device_mode.subprocess.run")
def test_device_mode_ipv4(mock_run):
    mock_run.return_value = MagicMock(
        returncode=1,  # simulate non-zero returncode but still valid output
        stdout="value: IPv4\n"
    )
    assert get_device_mode().lower() == "ipv4"

@patch("device_mode.subprocess.run")
def test_device_mode_ipv6(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="value: IPv6\n"
    )
    assert get_device_mode().lower() == "ipv6"

@patch("device_mode.subprocess.run")
def test_device_mode_not_found(mock_run):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="type: string\nparam: something_else\n"
    )
    with pytest.raises(ValueError, match="Device mode not found"):
        get_device_mode()
