@echo off
rem Publie le Garde-manger sur Internet : https://garde-manger-chi.vercel.app
rem Prerequis (une seule fois par PC) : npx vercel login
cd /d "%~dp0"
echo Construction de l'application...
call npm run build
if errorlevel 1 (
  echo La construction a echoue : rien n'a ete publie.
  pause
  exit /b 1
)
echo Publication sur Vercel...
cd dist
call npx vercel link --yes --project garde-manger --scope achat-7124s-projects
call npx vercel deploy --prod --yes
pause
