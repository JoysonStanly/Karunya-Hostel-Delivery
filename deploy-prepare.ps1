# Push to GitHub Script
# Run this before deploying to Render/Vercel

Write-Host "🚀 Preparing for Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check git status
Write-Host "Checking files to commit..." -ForegroundColor Yellow
git status

Write-Host ""
$commit = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commit)) {
    $commit = "Ready for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commit"

# Check if remote exists
$remoteExists = git remote -v | Select-String "origin"
if (-not $remoteExists) {
    Write-Host ""
    Write-Host "No remote repository found!" -ForegroundColor Red
    Write-Host "Please add your GitHub repository URL:" -ForegroundColor Yellow
    Write-Host "Example: https://github.com/JoysonStanly/Karunya-Hostel-Delivery.git" -ForegroundColor Cyan
    $repoUrl = Read-Host "Enter repository URL"
    
    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        git remote add origin $repoUrl
        Write-Host "Remote added successfully!" -ForegroundColor Green
    } else {
        Write-Host "Skipping remote setup. You can add it later with:" -ForegroundColor Yellow
        Write-Host "git remote add origin <your-repo-url>" -ForegroundColor Cyan
        exit
    }
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Render.com and sign up" -ForegroundColor White
    Write-Host "2. Deploy backend as 'Web Service' from your repo" -ForegroundColor White
    Write-Host "3. Deploy frontend as 'Static Site' from your repo" -ForegroundColor White
    Write-Host "4. Update CORS settings with your frontend URL" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "❌ Push failed. Possible reasons:" -ForegroundColor Red
    Write-Host "- Authentication required (use GitHub Personal Access Token)" -ForegroundColor Yellow
    Write-Host "- Branch already exists (try: git push -f origin main)" -ForegroundColor Yellow
    Write-Host "- Network issues" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
}
