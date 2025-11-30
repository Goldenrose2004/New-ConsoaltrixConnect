# How to Push Your Project to GitHub

## Step-by-Step Guide

### Prerequisites
- Git installed on your computer
- GitHub account created

---

## Method 1: Using Command Line (Recommended)

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`, type `cmd` or `powershell`, press Enter
- Or right-click in your project folder → "Open in Terminal"

**Mac/Linux:**
- Open Terminal app

### Step 2: Navigate to Your Project Folder

```bash
cd "C:\My Program Projects\Block A Capstone\Capstone_ConsolatrixConnectV2.1"
```

### Step 3: Check if Git is Already Initialized

```bash
git status
```

**If you see:** "fatal: not a git repository"
- Continue to Step 4 (Initialize Git)

**If you see:** file listings
- Skip to Step 6 (Add files)

### Step 4: Initialize Git Repository

```bash
git init
```

### Step 5: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 6: Add All Files

```bash
git add .
```

### Step 7: Create Initial Commit

```bash
git commit -m "Initial commit: ConsolatrixConnect PWA with offline functionality"
```

### Step 8: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `consolatrix-connect` (or your preferred name)
   - **Description**: "Digital School Handbook PWA with offline functionality"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (you already have files)
4. Click **"Create repository"**

### Step 9: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/consolatrix-connect.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 10: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or Personal Access Token).

---

## Method 2: Using GitHub Desktop (Easier for Beginners)

### Step 1: Download GitHub Desktop

1. Go to [desktop.github.com](https://desktop.github.com)
2. Download and install GitHub Desktop

### Step 2: Sign In

1. Open GitHub Desktop
2. Sign in with your GitHub account

### Step 3: Add Your Repository

1. Click **"File"** → **"Add Local Repository"**
2. Click **"Choose..."** and select your project folder:
   ```
   C:\My Program Projects\Block A Capstone\Capstone_ConsolatrixConnectV2.1
   ```
3. Click **"Add repository"**

### Step 4: Create GitHub Repository

1. Click **"Publish repository"** button (top right)
2. Fill in:
   - **Name**: `consolatrix-connect`
   - **Description**: "Digital School Handbook PWA"
   - **Visibility**: Public or Private
3. Click **"Publish repository"**

Done! Your code is now on GitHub.

---

## Method 3: Using VS Code (If You Use VS Code)

### Step 1: Open Project in VS Code

1. Open VS Code
2. File → Open Folder → Select your project folder

### Step 2: Initialize Git

1. Open Terminal in VS Code: `Ctrl + ~` (or View → Terminal)
2. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

### Step 3: Push to GitHub

1. Click the **Source Control** icon (left sidebar) or press `Ctrl + Shift + G`
2. Click **"Publish to GitHub"** button
3. Choose repository name and visibility
4. Click **"Publish"**

---

## Troubleshooting

### Error: "Authentication failed"

**Solution:** Use Personal Access Token instead of password:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select scopes: `repo` (full control)
4. Copy the token
5. Use token as password when pushing

### Error: "Repository not found"

**Solution:** 
- Check repository name is correct
- Make sure you have access to the repository
- Verify GitHub username is correct

### Error: "Large files detected"

**Solution:** 
- Check `.gitignore` includes `node_modules/`
- If you accidentally added large files:
  ```bash
  git rm -r --cached node_modules
  git commit -m "Remove node_modules from git"
  ```

### Want to Update Later?

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

---

## What Gets Pushed?

✅ **Will be pushed:**
- All source code files
- Configuration files
- Public assets (images, etc.)

❌ **Will NOT be pushed** (thanks to .gitignore):
- `node_modules/` folder
- `.env.local` (environment variables)
- `.next/` build folder
- Other temporary files

---

## Next Steps After Pushing

1. **Deploy to Render:**
   - Go to Render Dashboard
   - Connect your GitHub repository
   - Follow the deployment guide in `docs/DEPLOYMENT.md`

2. **Share Your Repository:**
   - Your code is now on GitHub
   - Share the repository URL with others
   - Collaborate with team members

---

## Quick Reference Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log
```

---

**Need Help?** 
- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc

