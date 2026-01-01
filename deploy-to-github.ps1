# Script to prepare and push FE to GitHub
# Run this script from the FE directory

Write-Host "🚀 Preparing FE for GitHub deployment..." -ForegroundColor Cyan

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "📦 Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules does not exist" -ForegroundColor Gray
}

# Check if .git exists
if (Test-Path ".git") {
    Write-Host "📂 Git repository already exists" -ForegroundColor Yellow
    Write-Host "📝 Adding all files..." -ForegroundColor Cyan
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Cyan
    git commit -m "Prepare for deployment to Render"
    
    Write-Host "✅ Files committed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 To push to GitHub, run:" -ForegroundColor Cyan
    Write-Host "   git remote add origin <your-github-repo-url>" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
} else {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan
    git init
    
    Write-Host "📝 Adding all files..." -ForegroundColor Cyan
    git add .
    
    Write-Host "💾 Creating initial commit..." -ForegroundColor Cyan
    git commit -m "Initial commit - React Portfolio Frontend"
    
    Write-Host "✅ Git repository initialized!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Next steps to push to GitHub:" -ForegroundColor Cyan
    Write-Host "   1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "   2. Run these commands:" -ForegroundColor White
    Write-Host "      git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
    Write-Host "      git branch -M main" -ForegroundColor Yellow
    Write-Host "      git push -u origin main" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Done! Your FE is ready for GitHub." -ForegroundColor Green



