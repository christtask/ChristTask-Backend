# Render Deployment Guide

## Prerequisites
- Render account
- OpenAI API key
- Pinecone API key and index
- Stripe account (for payments)

## Step-by-Step Deployment

### 1. Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click "New +" and select "Web Service"

### 2. Connect Your Repository
1. Connect your GitHub repository
2. Select the repository containing this backend
3. Choose the `backend` directory as the root directory

### 3. Configure the Service
- **Name**: `christtasklovable-ai-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Set Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
OPENAI_API_KEY=sk-proj-your_actual_openai_key
PINECONE_API_KEY=pcsk_your_actual_pinecone_key
PINECONE_INDEX_NAME=chatbot
```

### 5. Deploy
1. Click "Create Web Service"
2. Wait for build to complete
3. Your service will be available at: `https://your-service-name.onrender.com`

### 6. Test Your API
Test the endpoints:
- Health check: `GET https://your-service-name.onrender.com/`
- Chat: `POST https://your-service-name.onrender.com/api/chat`

## Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in package.json
2. **Environment variables**: Make sure all required env vars are set
3. **Port issues**: Render uses port 10000 by default
4. **RAG not working**: Verify OpenAI and Pinecone keys are correct

### Logs:
- Check Render logs in the dashboard
- Use `console.log()` for debugging
- Monitor the "Logs" tab in your Render service

## API Endpoints

- `GET /` - Health check
- `POST /api/chat` - RAG Chatbot endpoint
- `POST /api/create-checkout-session` - Stripe checkout
- `POST /api/verify-session` - Verify Stripe session
- `POST /api/webhook` - Stripe webhook
- `POST /api/validate-coupon` - Coupon validation
- `POST /api/create-subscription` - Create subscription
- `GET /api/check-subscription` - Check subscription status 