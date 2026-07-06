@echo off
rem Lance le Garde-manger sur ce PC. Fermer cette fenetre arrete l'application.
cd /d "%~dp0"
echo Demarrage du Garde-manger... le navigateur va s'ouvrir.
start "" "http://localhost:5173"
call npm run dev
