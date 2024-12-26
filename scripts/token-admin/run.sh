#!/bin/bash

# Initialize token
bun scripts/token-admin/create-token.ts

# Monitor token metrics
bun scripts/token-admin/monitor.ts 