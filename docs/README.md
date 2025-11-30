# Documentation Folder

This folder contains deployment and setup documentation for the ConsolatrixConnect project.

## Files in this folder:

- **`GITHUB_SETUP.md`** - Step-by-step guide for pushing your project to GitHub
- **`DEPLOYMENT.md`** - Complete guide for deploying to Render
- **`render.yaml`** - Render configuration file for automatic deployment

## Important Note about render.yaml

⚠️ **For Render Blueprint to work automatically**, you need to copy `render.yaml` from this `docs/` folder to the **root** of your project before pushing to GitHub.

### Quick Setup:

1. Copy `docs/render.yaml` to the project root
2. Push to GitHub
3. In Render Dashboard → New → Blueprint
4. Connect your repository
5. Render will automatically detect `render.yaml` in the root

Alternatively, you can use the manual deployment method described in `DEPLOYMENT.md` (Option A), which doesn't require `render.yaml` in the root.

---

## Quick Links

- [GitHub Setup Guide](./GITHUB_SETUP.md)
- [Render Deployment Guide](./DEPLOYMENT.md)

