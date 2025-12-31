Get-ChildItem -Path "c:\Users\S.Bharathi\Pictures\green (1)\green\frontend\src" -Recurse -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    if ($content -match "http://localhost:5000") {
        $content = $content -replace "http://localhost:5000", "https://geoshops-production.up.railway.app"
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated $($_.Name)"
    }
}
