Write-Host "Masuk ke folder Backend..." -ForegroundColor Cyan

try {
    cd Backend

    $ErrorActionPreference = "Stop"

    Write-Host "Resetting Prisma database..." -ForegroundColor Yellow
    npx prisma migrate reset --force --skip-seed
    npx prisma db push --accept-data-loss
    npx prisma db seed

    Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate

    Write-Host "Database reset completed!" -ForegroundColor Green
}
catch {
    Write-Host "Terjadi error saat reset database!" -ForegroundColor Red
    Write-Host $_
}
finally {
    Write-Host "Keluar dari folder Backend..." -ForegroundColor Cyan
    cd ..
}