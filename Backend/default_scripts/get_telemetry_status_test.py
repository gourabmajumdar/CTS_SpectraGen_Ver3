import pytest
from unittest.mock import patch, MagicMock
from telemetry import get_telemetry_status

@patch("telemetry.subprocess.run")
def test_telemetry_enabled_true(mock_run):
    mock_run.return_value = MagicMock(
        stdout=b"param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               b"type: bool\n"
               b"value: true\n"
    )
    assert get_telemetry_status() == True

@patch("telemetry.subprocess.run")
def test_telemetry_enabled_false(mock_run):
    mock_run.return_value = MagicMock(
        stdout=b"param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               b"type: bool\n"
               b"value: false\n"
    )
    assert get_telemetry_status() == False

@patch("telemetry.subprocess.run")
def test_telemetry_no_value_line(mock_run):
    mock_run.return_value = MagicMock(
        stdout=b"param: Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.Telemetry.Enable\n"
               b"type: bool\n"
    )
    assert get_telemetry_status() == False

@patch("telemetry.subprocess.run")
def test_telemetry_output_unexpected_format(mock_run):
    mock_run.return_value = MagicMock(
        stdout=b"unexpected output format with no value field"
    )
    assert get_telemetry_status() == False
