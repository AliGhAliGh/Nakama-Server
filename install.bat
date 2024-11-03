@echo off
setlocal

set "cockroach_url=https://binaries.cockroachdb.com/cockroach-v24.2.4.windows-6.2-amd64.zip"
set "resulr_dir=%~dp0bin"
set "cockroach_zip=%resulr_dir%\cockroach.zip"
set "cockroach_exe=%resulr_dir%\cockroach.exe"
set "cockroach_extract_dir=%resulr_dir%\cockroach-v24.2.4.windows-6.2-amd64"
set "nakama_url=https://github.com/heroiclabs/nakama/releases/download/v3.24.2/nakama-3.24.2-windows-amd64.tar.gz"
set "nakama_tar=%resulr_dir%\nakama.tar.gz"
set "nakama_exe=%resulr_dir%\nakama.exe"

powershell -ExecutionPolicy Bypass -File install/downloader.ps1 ^
    -cockroachUrl "%cockroach_url%" ^
    -resultDir "%resulr_dir%" ^
    -cockroachZip "%cockroach_zip%" ^
    -cockroachExe "%cockroach_exe%" ^
    -cockroachExtractDir "%cockroach_extract_dir%" ^
    -nakamaUrl "%nakama_url%" ^
    -nakamaTar "%nakama_tar%" ^
    -nakamaExe "%nakama_exe%"

start "database" bin/cockroach.exe start-single-node --insecure --listen-addr=127.0.0.1

set /p cacheMode="Use cache mode? (Y/N) [Y]: "
if "%cacheMode%"=="" set cacheMode=Y
if /I "%cacheMode%"=="Y" (
    echo "Using cached dependencies"
) else (
    echo "Installing dependencies without cache"
    cd src
    call npm install
    call npx tsc
    cd ..
)

"bin/nakama.exe" migrate up
start "server" bin/nakama.exe --config install/local.yml

:end
endlocal
pause