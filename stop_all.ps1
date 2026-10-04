# AgriAI - Stop All Services
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "       AgriAI - Stopping All Services" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

$ports = @(8000, 5173, 8081)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
            Write-Host "Stopping $($proc.ProcessName) on port $port (PID: $p)..." -ForegroundColor Red
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "No active process found on port $port." -ForegroundColor Gray
    }
}

Write-Host "`nAll AgriAI services have been stopped." -ForegroundColor Green
