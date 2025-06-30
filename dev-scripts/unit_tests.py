def test_unlock_work_orders():
    # Create a list of work order IDs to unlock
    work_order_ids = [1234567890, 9876543210]

    # Unlock the work orders
    unlock_work_orders(work_order_ids)

    # Check if the work orders are actually unlocked
    with open('lock_file.json', 'r') as f:
        lock_data = json.load(f)
        for work_order_id in work_order_ids:
            assert work_order_id not in lock_data['locked_work_orders']
```
This script first loads the existing lock file using the `json` library, and then checks if any of the provided work order IDs are already locked. If they are, it raises a `ValueError`. Otherwise, it unlocks the work orders by removing them from the `locked_work_orders` dictionary in the lock file. Finally, it saves the updated lock file using the same `json` library.

The script also includes a test function that creates a list of work order IDs to unlock and then calls the `unlock_work_orders` function with those IDs. The test checks if the work orders are actually unlocked by loading the lock file again and checking if the work order IDs are still present in the `locked_work_orders` dictionary.

Note that this is just an example implementation, and you may need to modify it to fit your specific use case. Additionally, you should ensure that the script is properly tested and validated before deploying it to production.