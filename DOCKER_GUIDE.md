# 🐳 Docker Deployment Guide

**Complete guide for running Bar National P&L Analysis Ultimate Edition with Docker**

## 🚀 Quick Start

### 1. Prerequisites
Make sure you have Docker and Docker Compose installed:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version
```

### 2. Start the Application
```bash
# Clone and navigate to the project
cd bar-national-pnl-ultimate

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application
- **Web Application**: http://localhost:3000
- **MongoDB**: localhost:27017

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   MongoDB DB    │    │   Seed Service  │
│   (Port 3000)   │◄──►│   (Port 27017)  │    │   (One-time)    │
│                 │    │                 │    │                 │
│ - Daily Input   │    │ - bar-national  │    │ - Sample Data   │
│ - Reports       │    │ - dailyreports  │    │ - 30 days       │
│ - Forecasting   │    │ - Indexes       │    │ - Realistic     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Available Commands

### Development Commands
```bash
# Start development server (without Docker)
npm run dev

# Build the application
npm run build

# Start production server
npm run start
```

### Docker Commands
```bash
# Build Docker image
npm run docker:build

# Run single container
npm run docker:run

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Seed database only
npm run docker:seed

# Clean everything
npm run docker:clean
```

### Docker Compose Commands
```bash
# Start services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Restart specific service
docker-compose restart app
docker-compose restart mongodb
```

## 🔧 Configuration

### Environment Variables
The application uses these environment variables:

```bash
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/bar-national?authSource=admin
PORT=3000
```

### Port Configuration
- **Application**: 3000
- **MongoDB**: 27017

To change ports, modify `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "3001:3000"  # Change 3001 to your desired port
  mongodb:
    ports:
      - "27018:27017"  # Change 27018 to your desired port
```

## 🗄️ Database Management

### MongoDB Access
```bash
# Connect to MongoDB container
docker-compose exec mongodb mongo

# Connect with authentication
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin

# Access specific database
docker-compose exec mongodb mongo bar-national -u bar-national-user -p bar-national-password
```

### Database Operations
```bash
# View collections
docker-compose exec mongodb mongo bar-national --eval "db.getCollectionNames()"

# Count documents
docker-compose exec mongodb mongo bar-national --eval "db.dailyreports.count()"

# View sample data
docker-compose exec mongodb mongo bar-national --eval "db.dailyreports.findOne()"
```

### Backup and Restore
```bash
# Backup database
docker-compose exec mongodb mongodump --db bar-national --out /backup

# Copy backup from container
docker cp $(docker-compose ps -q mongodb):/backup ./backup

# Restore database
docker-compose exec mongodb mongorestore --db bar-national /backup/bar-national
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :27017

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### 2. Container Won't Start
```bash
# Check container logs
docker-compose logs app
docker-compose logs mongodb

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart app
```

#### 3. Database Connection Issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Wait for MongoDB to be ready
sleep 10
```

#### 4. Application Not Loading
```bash
# Check application logs
docker-compose logs app

# Check if app is running
docker-compose ps app

# Restart application
docker-compose restart app
```

#### 5. Database Not Seeded
```bash
# Run seeding manually
docker-compose up seed

# Check if data exists
docker-compose exec mongodb mongo bar-national --eval "db.dailyreports.count()"
```

### Debugging Commands

```bash
# Enter application container
docker-compose exec app sh

# Enter MongoDB container
docker-compose exec mongodb bash

# Check container resources
docker stats

# Check container details
docker inspect <container_name>

# View all containers
docker ps -a

# Remove stopped containers
docker container prune
```

### Clean Start
```bash
# Stop and remove everything
docker-compose down -v

# Remove all containers
docker container prune -f

# Remove all images
docker image prune -f

# Remove all volumes
docker volume prune -f

# Start fresh
docker-compose up --build
```

## 📊 Monitoring

### Health Checks
```bash
# Check if services are running
docker-compose ps

# Check resource usage
docker stats

# Check logs
docker-compose logs -f
```

### Performance Monitoring
```bash
# Monitor container resources
docker stats --no-stream

# Check disk usage
docker system df

# Check volume usage
docker volume ls
```

## 🔒 Security Considerations

### Production Security
1. **Change default passwords** in `docker-compose.yml`
2. **Use environment files** for sensitive data
3. **Enable MongoDB authentication** (already configured)
4. **Use HTTPS** in production
5. **Regular security updates** for base images

### Environment File
Create `.env` file:
```bash
MONGODB_ROOT_PASSWORD=your_secure_password
MONGODB_USER_PASSWORD=your_secure_password
NODE_ENV=production
```

Update `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_ROOT_PASSWORD}
  MONGODB_URI: mongodb://admin:${MONGODB_USER_PASSWORD}@mongodb:27017/bar-national?authSource=admin
```

## 🚀 Production Deployment

### 1. Build Production Image
```bash
docker build -t bar-national-pnl-ultimate:latest .
```

### 2. Tag for Registry
```bash
docker tag bar-national-pnl-ultimate:latest your-registry/bar-national-pnl-ultimate:latest
```

### 3. Push to Registry
```bash
docker push your-registry/bar-national-pnl-ultimate:latest
```

### 4. Deploy to Production
```bash
# On production server
docker pull your-registry/bar-national-pnl-ultimate:latest
docker-compose up -d
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"
```

### Load Balancing
Use nginx or traefik for load balancing multiple app instances.

## 🔄 Updates and Maintenance

### Updating Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Updating Dependencies
```bash
# Update package.json
npm update

# Rebuild image
docker-compose up --build -d
```

### Database Maintenance
```bash
# Backup before updates
docker-compose exec mongodb mongodump --db bar-national --out /backup

# Update MongoDB
# Edit docker-compose.yml with new MongoDB version
docker-compose up --build -d
```

---

**Need Help?** Check the main README.md or contact support at info@barnational.bg
