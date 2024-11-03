param (
    [string]$cockroachUrl,
    [string]$resultDir,
    [string]$cockroachZip,
    [string]$cockroachExe,
    [string]$cockroachExtractDir,
    [string]$nakamaUrl,
    [string]$nakamaTar,
    [string]$nakamaExe
)

function DownloadFile {
    param (
        [string]$url,
        [string]$outputPath
    )

    $webClient = New-Object System.Net.WebClient
    $response = $webClient.OpenRead($url)
    $totalLength = [int]$webClient.ResponseHeaders['Content-Length']
    $readBytes = 0
    $buffer = New-Object byte[] 4096
    $fileStream = [System.IO.File]::Create($outputPath)

    while (($read = $response.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $fileStream.Write($buffer, 0, $read)
        $readBytes += $read
        $percent = [math]::Round(($readBytes / $totalLength) * 100, 2)
        
        $progressBar = ('#' * ($percent / 2)) + ('-' * (50 - ($percent / 2)))
        Write-Host -NoNewline "`r[$progressBar] $percent%"

        Start-Sleep -Milliseconds 100 
    }

    $fileStream.Close()
    $response.Close()
    Write-Host  
}

if (-not (Test-Path -Path $nakamaExe)) {
    Write-Output "Nakama executable not found, downloading..."
    if (-not (Test-Path -Path $resultDir)) { New-Item -ItemType Directory -Path $resultDir }

    DownloadFile -url $nakamaUrl -outputPath $nakamaTar

    tar -xf $nakamaTar -C $resultDir
    
    Get-ChildItem -Path $resultDir -File | Where-Object { $_.Name -ne "nakama.exe" } | Remove-Item -Force
}
else {
    Write-Output "Nakama executable already exists, skipping download."
}

if (-not (Test-Path -Path $cockroachExe)) {
    Write-Output "Cockroach executable not found, downloading..."
    if (-not (Test-Path -Path $resultDir)) { New-Item -ItemType Directory -Path $resultDir }

    DownloadFile -url $cockroachUrl -outputPath $cockroachZip

    Expand-Archive -Path $cockroachZip -DestinationPath $resultDir -Force
    Remove-Item -Path $cockroachZip -Force

    if (Test-Path "$cockroachExtractDir\cockroach.exe") {
        Move-Item -Path "$cockroachExtractDir\cockroach.exe" -Destination $resultDir
        Remove-Item -Recurse -Force -Path $cockroachExtractDir
    }
    else {
        Write-Output "cockroach.exe not found in extracted folder."
    }
}
else {
    Write-Output "Cockroach executable already exists, skipping download."
}

Write-Output "`nProcess completed."
