#!/bin/bash

# Script para inyectar los datos en Supabase cuando el proyecto esté activo

echo "Inyectando tendencias de Facebook..."
curl -X POST https://iobgtqomewcnhayoyzhb.functions.supabase.co/ingest-trends \
  -H "Content-Type: application/json" \
  -H "x-automation-key: miiles22" \
  -d @facebook_trend.json

echo -e "\nInyectando flujo de Facebook..."
curl -X POST https://iobgtqomewcnhayoyzhb.functions.supabase.co/ingest-discovery-flow \
  -H "Content-Type: application/json" \
  -H "x-automation-key: miiles22" \
  -d @facebook_flow.json

echo -e "\nInyectando tendencias de TikTok..."
curl -X POST https://iobgtqomewcnhayoyzhb.functions.supabase.co/ingest-trends \
  -H "Content-Type: application/json" \
  -H "x-automation-key: miiles22" \
  -d @tiktok_trend.json

echo -e "\nInyectando flujo de TikTok..."
curl -X POST https://iobgtqomewcnhayoyzhb.functions.supabase.co/ingest-discovery-flow \
  -H "Content-Type: application/json" \
  -H "x-automation-key: miiles22" \
  -d @tiktok_flow.json

echo -e "\n¡Proceso finalizado!"
