import pytest
from unittest.mock import patch, MagicMock
from uptime import retrieve_device_uptime

@patch("uptime.subprocess.run")
def test_retrieve_device_uptime_pass(mock_run):
    mock_run.return_value = MagicMock(stdout="value: 12345\n")
    assert retrieve_device_uptime() == True

@patch("uptime.subprocess.run")
def test_retrieve_device_uptime_fail(mock_run):
    mock_run.return_value = MagicMock(stdout="value: NotAvailable\n")
    assert retrieve_device_uptime() == False
