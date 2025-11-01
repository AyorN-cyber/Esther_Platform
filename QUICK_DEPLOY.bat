@echo off
echo ========================================
echo   Esther Reign Platform - Quick Deploy
echo ========================================
echo.

REM Check if git is configured
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Setting up Git configuration...
    set /p GIT_NAME="Enter your name: "
    set /p GIT_EMAIL="Enter your email: "
    git config user.name "%GIT_NAME%"
    git config user.email "%GIT_EMAIL%"
    echo Git configured successfully!
    echo.
)

echo Step 1: Adding all files...
git add .

echo Step 2: Committing changes...
git commit -m "Deploy Esther Reign Platform to GitHub Pages"

echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Deployment initiated!
echo ========================================
echo.
echo Your site will be live in 2-3 minutes at:
echo https://ayorn-cyber.github.io/Esther_Platform
echo.
echo Check deployment status:
echo https://github.com/AyorN-cyber/Esther_Platform/actions
echo.
pause
