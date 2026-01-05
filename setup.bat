@echo off

echo ==================================
echo MediCare Platform Setup Script
echo ==================================

REM Install Backend Dependencies
echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install
cd ..

REM Install Frontend Dependencies
echo.
echo 📦 Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ✅ Installation Complete!
echo.
echo ==================================
echo Next Steps:
echo ==================================
echo.
echo 1. Update backend\.env with your MongoDB URI
echo.
echo 2. Start Backend:
echo    cd backend
echo    npm start
echo.
echo 3. In another terminal, Start Frontend:
echo    cd frontend
echo    npm start
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo ==================================

pause
