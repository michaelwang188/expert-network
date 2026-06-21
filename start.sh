#!/bin/bash
cd /opt/prolink
git pull origin main
export PORT=80
npx next start -p 80 -H 0.0.0.0
