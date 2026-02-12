# Deployment Guide

## Quick Deploy to Vercel

The fastest way to deploy this application:

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Ryze UI Generator"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Done! Your app is live at `https://your-app.vercel.app`

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables (Optional)

If you want to pre-configure an API key:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_ANTHROPIC_API_KEY` = `sk-ant-...`
3. Redeploy

**Note:** The current implementation uses localStorage for API keys, which is fine for demo purposes. For production, you'd want proper authentication.

---

## Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

---

## Alternative: Deploy to Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: ryze-ui-generator
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

2. Connect GitHub repo to Render
3. Deploy

---

## Alternative: Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```

---

## Local Production Build

Test the production build locally:

```bash
# Build
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### Build Errors

If you get build errors:

1. Check Node version: `node -v` (should be 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check TypeScript: `npm run lint`

### Environment Variables Not Working

- Make sure to use `NEXT_PUBLIC_` prefix for client-side env vars
- Redeploy after adding env vars
- Check Vercel logs for errors

### API Key Issues

- Verify your Anthropic API key is valid
- Check you have credits remaining
- Ensure no firewall blocking api.anthropic.com

---

## Production Considerations

For a real production deployment, you would want to add:

1. **Authentication**: User accounts and API key management
2. **Rate Limiting**: Prevent abuse of the AI API
3. **Caching**: Cache generated UIs to save API calls
4. **Analytics**: Track usage patterns
5. **Error Reporting**: Sentry or similar
6. **CI/CD**: Automated testing and deployment

---

## Cost Estimate

With Anthropic API:
- ~3 API calls per UI generation
- ~1000 tokens per call = 3000 tokens total
- At $0.003/1K tokens for Sonnet 4: **~$0.01 per generation**

For a demo with 100 generations: **~$1 in API costs**

---

## Support

If you encounter deployment issues:
1. Check Vercel/Netlify logs
2. Verify all dependencies are in package.json
3. Ensure TypeScript compiles: `npm run build`
4. Test locally first: `npm run dev`

---

**Recommended Deployment: Vercel**
- Free tier available
- Automatic HTTPS
- Zero-config Next.js support
- CDN included
- Easy GitHub integration
