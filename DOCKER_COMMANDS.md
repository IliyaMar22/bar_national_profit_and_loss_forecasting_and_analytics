# 🐳 Docker Quick Reference Guide

## Essential Commands

### Start the Application
```bash
# Start both containers
docker start bar-national-mongodb bar-national-app

# Or start them separately
docker start bar-national-mongodb
docker start bar-national-app
```

### Stop the Application
```bash
# Stop both containers
docker stop bar-national-app bar-national-mongodb

# Or stop them separately
docker stop bar-national-app
docker stop bar-national-mongodb
```

### Check Container Status
```bash
# List all running containers
docker ps

# List all containers (including stopped)
docker ps -a
```

### View Logs
```bash
# View application logs
docker logs bar-national-app

# View MongoDB logs
docker logs bar-national-mongodb

# Follow logs in real-time
docker logs -f bar-national-app
docker logs -f bar-national-mongodb
```

### Rebuild Application
```bash
# Stop and remove the app container
docker stop bar-national-app
docker rm bar-national-app

# Rebuild and restart
docker build -t bar-national-pnl-ultimate .
docker run -d -p 8089:3000 --name bar-national-app --link bar-national-mongodb:mongodb bar-national-pnl-ultimate
```

### Access MongoDB Shell
```bash
# Connect to MongoDB shell
docker exec -it bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national

# Run a quick query
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national --eval "db.dailyreports.find().pretty()"
```

### Remove Everything (Clean Start)
```bash
# Stop and remove all containers
docker stop bar-national-app bar-national-mongodb
docker rm bar-national-app bar-national-mongodb

# Remove the image
docker rmi bar-national-pnl-ultimate

# Remove the MongoDB volume (⚠️ THIS DELETES ALL DATA!)
docker volume rm mongodb_data
```

### Restart Everything from Scratch
```bash
# 1. Stop and remove containers
docker stop bar-national-app bar-national-mongodb
docker rm bar-national-app bar-national-mongodb

# 2. Start MongoDB
docker run -d --name bar-national-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=bar-national \
  mongo:7.0

# 3. Wait for MongoDB to start
sleep 5

# 4. Build and start the app
cd /Users/bilyana/Downloads/.github-main/profile/bar-national-pnl-ultimate
docker build -t bar-national-pnl-ultimate .
docker run -d -p 8089:3000 --name bar-national-app --link bar-national-mongodb:mongodb bar-national-pnl-ultimate
```

## Container Management

### Inspect Container
```bash
# View container details
docker inspect bar-national-app
docker inspect bar-national-mongodb

# View container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' bar-national-mongodb
```

### Execute Commands in Container
```bash
# Access app container shell
docker exec -it bar-national-app /bin/bash

# Access MongoDB container shell
docker exec -it bar-national-mongodb /bin/bash
```

### Copy Files
```bash
# Copy file from container to host
docker cp bar-national-app:/app/package.json ./package.json

# Copy file from host to container
docker cp ./myfile.txt bar-national-app:/app/myfile.txt
```

## Network & Connectivity

### Test Application
```bash
# Check if app is running
curl http://localhost:8089

# Test API endpoint
curl http://localhost:8089/api/categories

# Test MongoDB connection from app container
docker exec bar-national-app ping bar-national-mongodb
```

### View Network Information
```bash
# List networks
docker network ls

# Inspect bridge network
docker network inspect bridge
```

## Database Operations

### View All Collections
```bash
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national --eval "db.getCollectionNames()"
```

### Count Documents
```bash
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national --eval "db.dailyreports.countDocuments()"
```

### Delete All Reports (⚠️ Careful!)
```bash
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national --eval "db.dailyreports.deleteMany({})"
```

### Seed Sample Data
```bash
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national --eval '
db.dailyreports.insertOne({
  date: "2025-10-22",
  staff_expenses: [
    { role: "Waiter 1", amount: 50 },
    { role: "Bartender 1", amount: 60 }
  ],
  expenses: [
    { type: "Stock Expenses", amount: 200 }
  ],
  revenues: {
    general: 500,
    pos: 300,
    cash: 200
  },
  summary: {
    total_expenses: 310,
    cash_turnover: -110,
    general_turnover: 190
  },
  notes: "Sample data",
  created_at: new Date(),
  updated_at: new Date()
})
'
```

## Troubleshooting

### Application Not Starting
```bash
# Check logs for errors
docker logs bar-national-app | tail -50

# Check if MongoDB is healthy
docker exec bar-national-mongodb mongosh --eval "db.adminCommand('ping')"

# Restart the app
docker restart bar-national-app
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is accessible
docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Check if containers can communicate
docker exec bar-national-app ping bar-national-mongodb

# View MongoDB logs
docker logs bar-national-mongodb | tail -50
```

### Port Already in Use
```bash
# Find what's using port 8089
lsof -i :8089

# Kill the process (if needed)
kill -9 <PID>

# Or use a different port
docker run -d -p 8090:3000 --name bar-national-app --link bar-national-mongodb:mongodb bar-national-pnl-ultimate
```

### Out of Disk Space
```bash
# Remove unused Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check Docker disk usage
docker system df
```

## Performance Monitoring

### View Resource Usage
```bash
# View real-time stats
docker stats

# View stats for specific containers
docker stats bar-national-app bar-national-mongodb
```

### Check Container Health
```bash
# Check if containers are healthy
docker ps --filter "name=bar-national"

# Inspect health status
docker inspect --format='{{.State.Health.Status}}' bar-national-app
```

## Backup & Restore

### Backup MongoDB Data
```bash
# Create backup directory
mkdir -p ./backups

# Backup database
docker exec bar-national-mongodb mongodump \
  -u admin -p password123 --authenticationDatabase admin \
  -d bar-national -o /backup

# Copy backup to host
docker cp bar-national-mongodb:/backup ./backups/$(date +%Y%m%d_%H%M%S)
```

### Restore MongoDB Data
```bash
# Copy backup to container
docker cp ./backups/20251022_194500 bar-national-mongodb:/restore

# Restore database
docker exec bar-national-mongodb mongorestore \
  -u admin -p password123 --authenticationDatabase admin \
  -d bar-national /restore/bar-national
```

## URLs

- **Application**: http://localhost:8089
- **MongoDB**: mongodb://admin:password123@localhost:27017/bar-national?authSource=admin

## Container Names

- **App Container**: `bar-national-app`
- **MongoDB Container**: `bar-national-mongodb`

## Default Credentials

- **MongoDB Username**: `admin`
- **MongoDB Password**: `password123`
- **MongoDB Database**: `bar-national`
- **MongoDB Auth Database**: `admin`

---

**💡 Tip**: Add these commands to your shell aliases for quick access!

```bash
# Add to ~/.zshrc or ~/.bashrc
alias bar-start='docker start bar-national-mongodb bar-national-app'
alias bar-stop='docker stop bar-national-app bar-national-mongodb'
alias bar-logs='docker logs -f bar-national-app'
alias bar-mongo='docker exec -it bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin bar-national'
alias bar-status='docker ps --filter "name=bar-national"'
```

