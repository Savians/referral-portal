# Savians Referral Portal

A comprehensive referral management system with separate frontend and backend services.

## Repository Structure

```
/
├── savians-referral-frontend/    # Next.js frontend application
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
└── savians-referral-backend/     # Node.js backend services (AWS Lambda)
    ├── src/
    ├── prisma/
    └── infrastructure/
```

## Frontend Deployment (AWS Amplify)

### Prerequisites
- AWS Account with Amplify access
- GitHub repository access
- Domain: `referrals.savians.com`

### Deployment Steps

1. **Connect to AWS Amplify**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Select GitHub and authorize
   - Choose repository: `Savians/referral-portal`
   - Select branch: `main`

2. **Configure Build Settings**
   - Amplify will automatically detect `amplify.yml` in the root
   - The configuration points to `savians-referral-frontend/` subdirectory
   - No manual configuration needed

3. **Environment Variables**
   Add these environment variables in Amplify Console:
   ```
   NEXT_PUBLIC_API_URL=https://zudo43ux6a.execute-api.us-east-1.amazonaws.com/api
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_8iYQkzRGV
   NEXT_PUBLIC_COGNITO_CLIENT_ID=5a7s5d5b7vv9ij30njnno5b4ck
   NEXT_PUBLIC_COGNITO_REGION=us-east-1
   ```

4. **Custom Domain**
   - In Amplify Console → Domain management
   - Add domain: `referrals.savians.com`
   - Follow DNS configuration instructions
   - Wait for SSL certificate provisioning

5. **Deploy**
   - Click "Save and deploy"
   - Monitor build logs
   - Once complete, test at your domain

## Backend Deployment (AWS Lambda)

The backend is already deployed using AWS CDK. It includes:
- Multiple Lambda functions (auth, admin, partner, payment, superadmin services)
- API Gateway endpoints
- RDS PostgreSQL database
- S3 for file storage
- Cognito for authentication

Backend API: `https://zudo43ux6a.execute-api.us-east-1.amazonaws.com/api`

## Development

### Frontend Local Development
```bash
cd savians-referral-frontend
npm install
npm run dev
```

### Backend Local Development
```bash
cd savians-referral-backend
npm install
npm run dev
```

## Features

- ✅ Multi-role authentication (Partner, Admin, Super Admin, Finance)
- ✅ Referral tracking and management
- ✅ Payment processing with approval workflow
- ✅ Payout tier management
- ✅ Email template customization
- ✅ Agreement template management
- ✅ Milestone bonus system
- ✅ Audit logging
- ✅ Dark mode support
- ✅ Responsive design

## Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- AWS Cognito SDK

**Backend:**
- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL
- AWS Lambda
- AWS CDK

## Support

For issues or questions, contact the development team.
