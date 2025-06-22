@echo off
echo Limpando cache e instalando dependencias...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
if exist .next rmdir /s /q .next

echo.
echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor de desenvolvimento...
call npm run dev

pause