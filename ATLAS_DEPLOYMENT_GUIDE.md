# 🌍 MongoDB Atlas + Railway Deployment Guide

## 📋 **Overview**

This guide walks you through deploying your Bar National P&L application to production using:
- **MongoDB Atlas** (Cloud database - FREE tier)
- **Railway.app** (Container hosting - FREE tier)

---

## 🔑 **IMPORTANT: Your Data is Safe!**

### **What Happens to Your Current Docker Setup?**

**Local Development (stays the same):**
```bash
docker-compose up -d  # Your local containers still work!
# Access: http://localhost:8089
```

**Production (new setup):**
- Next.js app → Railway container
- MongoDB → Atlas cloud (no container needed)
- **Your passwords stay hashed!** No re-hashing needed.

---

## 📊 **Migration Process**

### **Phase 1: Export Your Current Data**

#### **Step 1: Ensure Docker Containers are Running**

```bash
cd /Users/bilyana/Downloads/.github-main/profile/bar-national-pnl-ultimate
docker-compose up -d
```

#### **Step 2: Export Financial Database**

```bash
# Create backup directory
mkdir -p ./backups

# Export financial data
docker exec bar-national-mongodb mongodump \
  --uri="mongodb://admin:password123@localhost:27017/bar-national?authSource=admin" \
  --out=/dump

# Copy to your machine
docker cp bar-national-mongodb:/dump/bar-national ./backups/financial-db
```

#### **Step 3: Export Users Database**

```bash
# Export users data
docker exec bar-national-users-mongodb mongodump \
  --uri="mongodb://admin:password123@localhost:27017/bar-national-users?authSource=admin" \
  --out=/dump

# Copy to your machine
docker cp bar-national-users-mongodb:/dump/bar-national-users ./backups/users-db
```

**✅ Your data is now backed up in `./backups/`**

---

## 🌐 **Phase 2: Set Up MongoDB Atlas**

### **Step 1: Create MongoDB Atlas Account**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email
3. Choose **FREE tier** (M0 Sandbox)

### **Step 2: Create Your Clusters**

#### **Create Cluster 1: Financial Data**

1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Choose **AWS** as provider
4. Choose region closest to you
5. Name cluster: `bar-national-financial`
6. Click "Create"

#### **Create Cluster 2: Users Data**

1. Click "Build a Database" again
2. Choose **FREE** tier (M0)
3. Choose **AWS** as provider
4. Choose same region as above
5. Name cluster: `bar-national-users`
6. Click "Create"

### **Step 3: Create Database User**

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `bar-admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

### **Step 4: Allow Network Access**

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for now)
   - IP Address: `0.0.0.0/0`
   - Comment: "Allow all (Railway deployment)"
4. Click "Confirm"

⚠️ **Note:** For production, you'll want to restrict this to only Railway's IPs.

### **Step 5: Get Connection Strings**

#### **For Financial Database:**

1. Go to "Database" → Your `bar-national-financial` cluster
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://bar-admin:<password>@bar-national-financial.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name after `.net/`:
   ```
   mongodb+srv://bar-admin:YourPassword@bar-national-financial.xxxxx.mongodb.net/bar-national?retryWrites=true&w=majority
   ```

#### **For Users Database:**

1. Go to your `bar-national-users` cluster
2. Click "Connect"
3. Choose "Connect your application"
4. Copy and modify like above:
   ```
   mongodb+srv://bar-admin:YourPassword@bar-national-users.xxxxx.mongodb.net/bar-national-users?retryWrites=true&w=majority
   ```

**Save these connection strings!** You'll need them soon.

---

## 📤 **Phase 3: Import Data to Atlas**

### **Step 1: Install MongoDB Tools** (if not installed)

**macOS:**
```bash
brew install mongodb-database-tools
```

**Linux:**
```bash
sudo apt-get install mongodb-database-tools
```

### **Step 2: Import Financial Data**

```bash
cd /Users/bilyana/Downloads/.github-main/profile/bar-national-pnl-ultimate

mongorestore \
  --uri="mongodb+srv://bar-admin:YourPassword@bar-national-financial.xxxxx.mongodb.net/bar-national?retryWrites=true&w=majority" \
  ./backups/financial-db
```

### **Step 3: Import Users Data**

```bash
mongorestore \
  --uri="mongodb+srv://bar-admin:YourPassword@bar-national-users.xxxxx.mongodb.net/bar-national-users?retryWrites=true&w=majority" \
  ./backups/users-db
```

### **Step 4: Verify Data**

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections" on each cluster
3. You should see:
   - **Financial cluster:** `dailyreports` collection
   - **Users cluster:** `users` collection with your 2-3 users

**✅ Your data is now in the cloud! Passwords are still hashed and secure!**

---

## 🚂 **Phase 4: Deploy to Railway**

### **Step 1: Create Railway Account**

1. Go to: https://railway.app/
2. Sign up with GitHub (easier for deployment)

### **Step 2: Create New Project**

1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select repository: `bar_national_profit_and_loss_forecasting_and_analytics`
5. Railway will detect your Dockerfile automatically!

### **Step 3: Configure Environment Variables**

1. Go to your project → "Variables" tab
2. Add these variables:

```env
MONGODB_URI=mongodb+srv://bar-admin:YourPassword@bar-national-financial.xxxxx.mongodb.net/bar-national?retryWrites=true&w=majority

MONGODB_USERS_URI=mongodb+srv://bar-admin:YourPassword@bar-national-users.xxxxx.mongodb.net/bar-national-users?retryWrites=true&w=majority

NEXTAUTH_SECRET=your-super-secret-key-change-this

NEXTAUTH_URL=https://your-app-url.railway.app

NODE_ENV=production

PORT=3000
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### **Step 4: Deploy!**

1. Railway will automatically build and deploy
2. Wait 5-10 minutes for first deployment
3. You'll get a URL like: `https://bar-national-pnl-ultimate.railway.app`

### **Step 5: Update NEXTAUTH_URL**

1. Copy your Railway app URL
2. Go back to "Variables"
3. Update `NEXTAUTH_URL` to your actual Railway URL
4. Railway will auto-redeploy

---

## ✅ **Phase 5: Test Your Production App**

### **Step 1: Access Your App**

Open your Railway URL: `https://your-app-url.railway.app`

### **Step 2: Login with Existing Users**

Try logging in with your existing users:
- Email: `simeonivanov0722@gmail.com`
- Password: `Moni22`

OR

- Email: `imarkovski@proton.me`
- Password: `Maiskaovca22`

**Your passwords should work!** The hashes migrated correctly.

### **Step 3: Test All Features**

- ✅ Add daily reports
- ✅ View calendar
- ✅ Check reports
- ✅ Try forecasting
- ✅ View analytics dashboard

---

## 🔄 **How to Update Your App**

### **For Production (Railway):**

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Railway **automatically deploys** the new version!

### **For Local Development:**

```bash
# Still use Docker for local testing
docker-compose up -d
# Access at http://localhost:8089
```

---

## 🆚 **Comparison: Local vs Production**

| Feature | Local Docker | Production (Railway + Atlas) |
|---------|--------------|------------------------------|
| **Database** | Docker containers | MongoDB Atlas cloud |
| **App** | Docker container | Railway container |
| **URL** | localhost:8089 | your-app.railway.app |
| **Uptime** | Only when running | 24/7 online |
| **Backups** | Manual | Automatic (Atlas) |
| **Cost** | Free | Free tier available |
| **Deployment** | Manual | Auto on git push |

---

## 💰 **Cost Breakdown**

### **MongoDB Atlas:**
- Financial DB: **FREE** (M0 tier - 512MB)
- Users DB: **FREE** (M0 tier - 512MB)
- Total: **$0/month**

### **Railway:**
- Free tier: $5 credit/month
- After free tier: ~$5-10/month
- First month: **FREE**

**Total Initial Cost: $0**

---

## 🎯 **Summary**

### **What Changed:**
- ❌ **Removed:** Local MongoDB Docker containers in production
- ✅ **Added:** MongoDB Atlas cloud databases
- ✅ **Kept:** Your Next.js app in Docker
- ✅ **Kept:** All your data and passwords (hashed)

### **What Stayed the Same:**
- ✅ Your local development setup (docker-compose)
- ✅ Your password hashes
- ✅ All your code and features
- ✅ User authentication works exactly the same

### **What You Gained:**
- ✅ 24/7 online availability
- ✅ Automatic backups
- ✅ Automatic deployments
- ✅ Free SSL certificate
- ✅ Professional production setup

---

## 🆘 **Troubleshooting**

### **Issue: "Invalid email or password" after migration**

**Solution:** Your passwords are correct! Check:
1. Did the users collection import to Atlas?
2. Check in Atlas: Database → Browse Collections → users
3. You should see documents with `passwordHash` field

### **Issue: "MongoNetworkError: connection timed out"**

**Solution:** 
1. Check Atlas Network Access
2. Make sure `0.0.0.0/0` is allowed
3. Verify your connection string has the correct password

### **Issue: Railway deployment failed**

**Solution:**
1. Check Railway logs
2. Verify all environment variables are set
3. Make sure `NEXTAUTH_URL` matches your Railway URL

---

## 📞 **Need Help?**

If you encounter any issues during deployment:
1. Check Railway logs: Project → Deployments → Click latest deployment
2. Check Atlas connection: Database → Connect → Test connection
3. Verify environment variables match your actual Atlas URLs

---

## 🎉 **Congratulations!**

You've successfully deployed a production-grade application with:
- ✅ Cloud-hosted databases
- ✅ Containerized application
- ✅ Automatic deployments
- ✅ Professional infrastructure

Your app is now accessible 24/7 from anywhere in the world! 🌍

