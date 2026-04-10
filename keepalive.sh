#!/bin/bash
while true; do
  cd /home/z/my-project
  node .next/standalone/server.js 2>/dev/null &
  SERVER_PID=$!
  # Ping every 10s to keep alive
  for i in $(seq 1 30); do
    sleep 10
    curl -s -o /dev/null http://localhost:3000 2>/dev/null || break
  done
  kill $SERVER_PID 2>/dev/null
  sleep 2
done
