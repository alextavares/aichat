#!/bin/bash

# Script to process pending MercadoPago webhooks
# This runs every minute via Digital Ocean App Platform worker

echo "$(date): Starting webhook processing..."

# Change to the app directory
cd /workspace || exit 1

# Run the TypeScript webhook processor using tsx (TypeScript executor)
npx tsx scripts/process-pending-webhooks.ts

echo "$(date): Webhook processing completed"