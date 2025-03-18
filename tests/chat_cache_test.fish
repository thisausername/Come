#!/usr/bin/env fish

set PROJECT_ROOT (realpath (dirname (status --current-filename))/..)
set LOCUST_FILE "locust/chat_cache.py"
set OUTPUT_DIR "logs/chat_cache"
set HOST "http://localhost"
set USERS 500
set RATE 10
set DURATION "1m"

mkdir -p $OUTPUT_DIR

function run_locust_test
    set TEST_NAME $argv[1]
    set USE_CACHE $argv[2]

    echo "Running cache test: $TEST_NAME (USE_CHAT_CACHE=$USE_CACHE)"

    if test -f "$PROJECT_ROOT/.env"
        sed -i "s/USE_CHAT_CACHE=.*/USE_CHAT_CACHE=$USE_CACHE/" "$PROJECT_ROOT/.env"
    else
        echo "USE_CHAT_CACHE=$USE_CACHE" > "$PROJECT_ROOT/.env"
    end

    sudo docker-compose -f "$PROJECT_ROOT/docker-compose.yml" restart chat-service
    sleep 5

    uv run locust -f $LOCUST_FILE \
        --headless \
        --host=$HOST \
        --users=$USERS \
        --spawn-rate=$RATE \
        --run-time=$DURATION \
        --csv="$OUTPUT_DIR/$TEST_NAME" \
        > "$OUTPUT_DIR/$TEST_NAME.log" 2>&1

    echo "Test $TEST_NAME completed. Results saved to $OUTPUT_DIR/$TEST_NAME.csv"
end

if not command -v uv > /dev/null
    echo "uv not found. Please install it (e.g., 'pip install uv')"
    exit 1
end

if not test -f $LOCUST_FILE
    echo "Locust file not found at $LOCUST_FILE"
    exit 1
end

echo "Cleaning up old Locust processes..."
pkill -f "locust -f $LOCUST_FILE"; or echo "No old Locust processes found"
sleep 1

run_locust_test "without_redis" "false"
run_locust_test "with_redis" "true"

echo "Cache test results:"
echo "1. Without Redis: $OUTPUT_DIR/without_redis_stats.csv"
echo "2. With Redis: $OUTPUT_DIR/with_redis_stats.csv"
echo "Check CSV files for detailed metrics (e.g., response time, RPS)"
echo "Log files: $OUTPUT_DIR/without_redis.log, $OUTPUT_DIR/with_redis.log"
