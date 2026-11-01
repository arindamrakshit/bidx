@echo off
title BidX Frontend Server (Port 5173)
color 0B
echo ===================================================
echo Starting BidX React Frontend on Port 5173...
echo ===================================================
cd /d C:\Users\ARINDAM\.gemini\antigravity\scratch\bidx\frontend
call npx vite --host --port 5173
pause
