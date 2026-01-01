#!/bin/bash

# Script to prepare and push FE to GitHub
# Run this script from the FE directory

echo "🚀 Preparing FE for GitHub deployment..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "📦 Removing node_modules..."
    rm -rf node_modules
    echo "✅ node_modules removed"
else
    echo "ℹ️  node_modules does not exist"
fi

# Check if .git exists
if [ -d ".git" ]; then
    echo "📂 Git repository already exists"
    echo "📝 Adding all files..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "Prepare for deployment to Render"
    
    echo "✅ Files committed!"
    echo ""
    echo "📤 To push to GitHub, run:"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git branch -M main"
    echo "   git push -u origin main"
else
    echo "🔧 Initializing Git repository..."
    git init
    
    echo "📝 Adding all files..."
    git add .
    
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit - React Portfolio Frontend"
    
    echo "✅ Git repository initialized!"
    echo ""
    echo "📤 Next steps to push to GitHub:"
    echo "   1. Create a new repository on GitHub"
    echo "   2. Run these commands:"
    echo "      git remote add origin <your-github-repo-url>"
    echo "      git branch -M main"
    echo "      git push -u origin main"
fi

echo ""
echo "✨ Done! Your FE is ready for GitHub."



