@echo off
echo Running Nakama Server ...
cd "%~dp0"

REM Ask user for cache mode or full build with a default to "Y"
set /p cacheMode="Use cache mode? (Y/N) [Y]: "
if "%cacheMode%"=="" set cacheMode=Y
if /I "%cacheMode%"=="Y" (
    set noCacheOption=""
    set USE_CACHE=true
) else (
    set noCacheOption="--no-cache"
    set USE_CACHE=false
)

REM Perform the build and check for errors
docker compose stop
set docker compose build %noCacheOption% USE_CACHE=%USE_CACHE%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [31mBuild Failed![0m
    goto :end
)

REM If not using cache, create node_modules.tar
if /I "%USE_CACHE%"=="false" (
    echo Creating node_modules.tar for full build...
    tar -cvf node_modules.tar node_modules
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [31mFailed to create node_modules.tar![0m
        goto :end
    )
)

REM Run docker compose up if build succeeds
docker compose up
:end
pause
