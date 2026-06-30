-- Migration: add_fcm_token_to_device_connected
-- Adds the fcm_token column to the DeviceConnected table

ALTER TABLE "DeviceConnected" ADD COLUMN IF NOT EXISTS "fcm_token" TEXT;
