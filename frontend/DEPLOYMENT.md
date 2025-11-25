# Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the Medicare React frontend to static hosting services.

## Prerequisites

- Node.js 18+ installed
- Built application (`npm run build`)
- Git repository

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables:
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   VITE_NODE_ENV=production
   VITE_APP_NAME=Medicare
   VITE_APP_VERSION=1.0.0
   ```

## Build Process

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Preview build locally:
   ```bash
   npm run preview
   ```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Connect your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Environment Variables**
   - Add environment variables in Vercel dashboard
   - Variables will be prefixed with `VITE_` automatically

4. **Deploy**
   - Vercel automatically deploys on git push
   - Get your deployment URL

### Option 2: Deploy to Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com) and sign up

2. **Connect Repository**
   - Click "New site from Git"
   - Connect GitHub repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add your environment variables

4. **Deploy**
   - Netlify auto-deploys on git push

### Option 3: Deploy to GitHub Pages

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist",
       "predeploy": "npm run build"
     },
     "homepage": "https://yourusername.github.io/medicare"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch

## Custom Domain Setup

### Vercel
1. Go to project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### Netlify
1. Go to site dashboard
2. Click "Domain management"
3. Add custom domain
4. Configure DNS records

### GitHub Pages
1. Go to repository Settings → Pages
2. Click "Add a custom domain"
3. Configure DNS records

## HTTPS Configuration

All recommended platforms (Vercel, Netlify, GitHub Pages) provide automatic HTTPS certificates via Let's Encrypt.

## Caching Strategies

### Vercel
- Automatic caching headers
- CDN edge network
- Image optimization built-in

### Netlify
- Automatic asset optimization
- CDN with edge locations
- Cache control headers

### Performance Optimization

The build process includes:
- Code splitting via Vite
- Asset optimization
- Minification
- Tree shaking

## Environment Variables

### Development
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### Production
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Build failures**
   - Check Node.js version
   - Verify all dependencies are installed
   - Check build logs

2. **Environment variables not working**
   - Ensure variables are prefixed with `VITE_`
   - Restart development server after changes

3. **404 errors on refresh**
   - Configure SPA redirect rules (see below)

### SPA Redirect Rules

For single-page applications, configure redirect rules:

**Vercel (`vercel.json`)**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify (`_redirects` in public folder)**:
```
/*    /index.html   200
```

**GitHub Pages**: Add to `index.html`:
```html
<script type="text/javascript">
  // Single Page Apps for GitHub Pages
  // MIT License
  // https://github.com/rafgraph/spa-github-pages
  // This script takes the current url and converts the path and query
  // string into just a query string, and then redirects the browser
  // to the new url with only a query string and hash fragment,
  // e.g., https://www.foo.tld/one/two?a=b&c=d#qwe, becomes
  // https://www.foo.tld/?/one/two&a=b~and~c=d#qwe
  // Note: this 404.html file must be at least 512 bytes for it to work
  // with Internet Explorer (it is currently > 512 bytes)

  // If you're creating a Project Pages site and NOT using a custom domain,
  // then set pathSegmentsToKeep to 1 (enterprise users may need to set it to > 1).
  // This way the code will only replace the route part and not the real directory.
  // For example, if your repository is 'my-app', and you're using GitHub Pages
  // at https://username.github.io/my-app, then set pathSegmentsToKeep to 1.
  // If you're using a custom domain, set pathSegmentsToKeep to 0.
  var pathSegmentsToKeep = 1;

  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
</script>
```

## Analytics and Monitoring

### Optional: Add Google Analytics

1. Create GA4 property
2. Add tracking ID to environment variables
3. Include GA script in `index.html`

### Performance Monitoring

Consider adding:
- Web Vitals monitoring
- Error tracking (Sentry)
- Real user monitoring

## CDN and Performance

- All platforms provide global CDN
- Assets are automatically optimized
- Consider using a service like Cloudflare for additional performance

## Backup and Rollback

- Keep deployment history
- Use git tags for releases
- Document rollback procedures