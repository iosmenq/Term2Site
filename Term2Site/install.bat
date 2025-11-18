@echo off
echo Launching Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker to start...
:waitdocker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto waitdocker
)
echo Docker is running!

echo Building Docker image...
docker build -t myapp:latest .
if %errorlevel% neq 0 (
    echo Docker build failed!
    exit /b %errorlevel%
)
echo Docker image built successfully!

echo Installing Node.js packages...
docker run --rm -v %cd%:/app -w /app myapp:latest npm install
if %errorlevel% neq 0 (
    echo Failed to install Node.js packages!
    exit /b %errorlevel%
)
echo Node.js packages installed successfully!

pause
