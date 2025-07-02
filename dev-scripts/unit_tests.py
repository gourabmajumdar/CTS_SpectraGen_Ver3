import unittest
from mock import patch

class TestCheckMapTStatus(unittest.TestCase):
    @patch('subprocess.check_output')
    def test_check_map_t_status(self, mock_check_output):
        # Set up the mock output for the dmcli command
        mock_check_output.return_value = b"Device.X_RDK_WAN_Manage.MAP-T.Status Enabled\n"
        
        # Call the function to check the MAP-T status
        result = check_map_t_status("device")
        
        # Assert that the function returns True
        self.assertTrue(result)
```
Note: The above code is just an example and may need to be modified based on the specific requirements of your project. Additionally, it's important to note that this code assumes that the `dmcli` command is available on the system and that the user has the necessary permissions to execute it.