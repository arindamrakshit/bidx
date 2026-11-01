@echo off
title BidX Backend Server (Port 8080)
color 0A
echo ===================================================
echo Starting BidX Spring Boot Backend on Port 8080...
echo ===================================================
cd /d C:\Users\ARINDAM\.gemini\antigravity\scratch\bidx\backend
"C:\Users\ARINDAM\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
pause
