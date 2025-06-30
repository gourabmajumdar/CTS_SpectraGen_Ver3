Here is an example of a Python script that implements the unlock work orders functionality for vcmts, based on the provided requirements and technical notes:
```python
import os
import json
from imoscripts.vcmts import lock_work_orders

def unlock_work_orders(work_order_ids):
    # Load the existing lock file
    with open('lock_file.json', 'r') as f:
        lock_data = json.load(f)

    # Check if any of the work orders are locked
    for work_order_id in work_order_ids:
        if work_order_id in lock_data['locked_work_orders']:
            raise ValueError('Work order is already locked')

    # Unlock the work orders
    for work_order_id in work_order_ids:
        del lock_data['locked_work_orders'][work_order_id]

    # Save the updated lock file
    with open('lock_file.json', 'w') as f:
        json.dump(lock_data, f)

# Test the unlock work orders functionality