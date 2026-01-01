# Script to test build locally before deploying to Render
# Run this from the FE directory

Write-Host "🧪 Testing build for Render deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Check if dist folder exists
if (Test-Path "dist") {
    Write-Host "📁 Build output in 'dist' folder:" -ForegroundColor Cyan
    Get-ChildItem "dist" | Select-Object Name, Length | Format-Table
    Write-Host ""
    Write-Host "✅ Your project is ready for Render deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 To preview locally, run: npm run preview" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Warning: dist folder not found" -ForegroundColor Yellow
}

