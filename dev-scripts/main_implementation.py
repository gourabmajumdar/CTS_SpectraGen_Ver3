User Story: As a software developer, I want to generate production-ready code for checking the MAP-T status on a RDK-B enabled device using dmcli commands.

Acceptance Criteria:

1. The code should use the existing libraries and frameworks when appropriate.
2. The code should follow established project patterns and coding standards.
3. The code should include robust error handling and validation.
4. The code should be tested with comprehensive unit tests to ensure good coverage.
5. The code should implement exactly what the user story requests.
6. All acceptance criteria must be met.

Implementation:
```python
import subprocess

def check_map_t_status(device):
    """Checks the MAP-T status on a RDK-B enabled device using dmcli commands."""
    # Execute the dmcli command to get the MAP-T status
    cmd = f"dmcli eRT getv Device.X_RDK_WAN_Manage.MAP-T.Status"
    output = subprocess.check_output(cmd, shell=True)
    
    # Parse the output to extract the MAP-T status
    status = output.decode("utf-8").splitlines()[0].strip().split(" ")[1]
    
    if status == "Enabled":
        return True
    else:
        return False
```
Unit Test:
```python