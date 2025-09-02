# Deployment Configuration Guide

## Backend Deployment (Vercel)

1. **Deploy Backend to Vercel:**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Copy the backend URL** (something like: `https://inventory-backend-xxx.vercel.app`)

3. **Update Frontend Environment:**
   - Update `/frontend/.env.production` with your backend URL
   - Or set environment variable in Vercel dashboard

## Frontend Environment Setup

### For Production (.env.production):
```env
JWT_SECRET=rudra123
VITE_REACT_APP_API_BASE_URL="https://your-backend-url.vercel.app"
```

### For Development (.env):
```env
JWT_SECRET=rudra123
VITE_REACT_APP_API_BASE_URL="http://localhost:5000"
```

## Vercel Environment Variables

In your Vercel dashboard for the frontend project, add:
- Key: `VITE_REACT_APP_API_BASE_URL`
- Value: `https://your-backend-url.vercel.app`

## Testing

1. Deploy backend first
2. Get backend URL
3. Update frontend environment
4. Redeploy frontend
5. Test API connections

## Current Status

✅ Frontend deployed: https://inventory-sigma-three.vercel.app/
⏳ Backend deployment needed
⏳ Environment variables need backend URL
