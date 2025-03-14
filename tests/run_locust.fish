#!/usr/bin/env fish

set SCRIPT "locust/chat_ws.py"
set USERS 1000
set RATE 50
set DURATION "60s"
set WORKERS 2
set MASTER_HOST "localhost"
set LOG_DIR "logs"

mkdir -p $LOG_DIR

echo "Cleaning up old Locust processes..."
pkill -f "locust -f $SCRIPT"; or echo "No old Locust processes found"
sleep 1

echo "Starting Locust master..."
uv run locust -f $SCRIPT --master --headless -u $USERS -r $RATE -t $DURATION > $LOG_DIR/master.log 2>&1 &
set MASTER_PID $last_pid
echo "Master PID: $MASTER_PID"

sleep 2

set WORKER_PIDS
for i in (seq 1 $WORKERS)
    echo "Starting Locust worker $i..."
    uv run locust -f $SCRIPT --worker --master-host=$MASTER_HOST > $LOG_DIR/worker_$i.log 2>&1 &
    set -a WORKER_PIDS $last_pid
    echo "Worker $i PID: $WORKER_PIDS[-1]"
end

echo "Running test for $DURATION..."
set DURATION_SECS (string replace -r 's' '' $DURATION)
sleep $DURATION_SECS
wait $MASTER_PID $WORKER_PIDS

echo "Test completed. Check logs in $LOG_DIR:"
ls -l $LOG_DIR
cat $LOG_DIR/master.log
