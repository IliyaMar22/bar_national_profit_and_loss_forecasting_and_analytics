# 🗄️ DBeaver MongoDB Connection Setup

## Connection Details

Use these credentials to connect to the MongoDB database with DBeaver:

### Connection Settings

| Setting | Value |
|---------|-------|
| **Connection Type** | MongoDB |
| **Host** | `localhost` |
| **Port** | `27017` |
| **Database** | `bar-national` |
| **Authentication** | Username/Password |
| **Username** | `admin` |
| **Password** | `password123` |
| **Authentication Database** | `admin` |

## Step-by-Step Setup

### 1. Open DBeaver
Launch DBeaver application on your computer.

### 2. Create New Connection
- Click on **Database** → **New Database Connection**
- Or use the shortcut: **Ctrl+Shift+N** (Windows/Linux) or **Cmd+Shift+N** (Mac)

### 3. Select MongoDB
- In the connection wizard, search for **MongoDB**
- Select **MongoDB** from the list
- Click **Next**

### 4. Enter Connection Details
Fill in the following details:

**Main Tab:**
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `bar-national`
- **Authentication**: Select "Username/Password"
- **User name**: `admin`
- **Password**: `password123`

**Advanced Tab (if available):**
- **Authentication Database**: `admin`

### 5. Test Connection
- Click **Test Connection** button
- You should see a success message
- If you see an error, make sure:
  - Docker containers are running (`docker ps`)
  - MongoDB container is accessible on port 27017

### 6. Connect
- Click **Finish** to save the connection
- Double-click on the connection to connect to the database

## Database Structure

### Collections

#### 1. **dailyreports**
Stores daily financial reports with the following structure:

```javascript
{
  _id: ObjectId,
  date: String,              // Format: "YYYY-MM-DD"
  staff_expenses: [
    {
      role: String,          // e.g., "Waiter 1", "Bartender 1"
      amount: Number,        // Expense amount in BGN
      _id: ObjectId
    }
  ],
  expenses: [
    {
      type: String,          // e.g., "Stock Expenses", "Utilities"
      amount: Number,        // Expense amount in BGN
      _id: ObjectId
    }
  ],
  revenues: {
    general: Number,         // Total general revenue in BGN
    pos: Number,            // POS terminal revenue in BGN
    cash: Number            // Calculated: general - pos
  },
  summary: {
    total_expenses: Number,  // Sum of all expenses
    cash_turnover: Number,   // cash revenue - total_expenses
    general_turnover: Number // general revenue - total_expenses
  },
  notes: String,            // Optional notes
  created_at: ISODate,
  updated_at: ISODate,
  __v: Number
}
```

#### 2. **categories**
Stores predefined categories for staff roles and expense types.

## Useful Queries

### View All Reports
```javascript
db.dailyreports.find().pretty()
```

### View Reports for Specific Date
```javascript
db.dailyreports.find({ date: "2025-10-22" }).pretty()
```

### View Reports with Revenue > 1000
```javascript
db.dailyreports.find({ "revenues.general": { $gt: 1000 } }).pretty()
```

### Count Total Reports
```javascript
db.dailyreports.countDocuments()
```

### View Latest 10 Reports
```javascript
db.dailyreports.find().sort({ created_at: -1 }).limit(10).pretty()
```

### Aggregate Total Revenue by Month
```javascript
db.dailyreports.aggregate([
  {
    $group: {
      _id: { $substr: ["$date", 0, 7] },
      total_revenue: { $sum: "$revenues.general" },
      total_expenses: { $sum: "$summary.total_expenses" }
    }
  },
  { $sort: { _id: -1 } }
])
```

## Troubleshooting

### Connection Failed
1. Check if Docker containers are running:
   ```bash
   docker ps
   ```
   You should see both `bar-national-app` and `bar-national-mongodb` running.

2. Check MongoDB logs:
   ```bash
   docker logs bar-national-mongodb
   ```

3. Verify MongoDB is accessible:
   ```bash
   docker exec bar-national-mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
   ```

### Authentication Failed
- Make sure you're using the correct credentials:
  - Username: `admin`
  - Password: `password123`
  - Authentication Database: `admin`

### Port Already in Use
If port 27017 is already in use:
```bash
# Stop the MongoDB container
docker stop bar-national-mongodb

# Remove the container
docker rm bar-national-mongodb

# Start with a different port (e.g., 27018)
docker run -d --name bar-national-mongodb -p 27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0
```

## Backup and Restore

### Backup Database
```bash
docker exec bar-national-mongodb mongodump \
  -u admin -p password123 --authenticationDatabase admin \
  -d bar-national -o /backup

docker cp bar-national-mongodb:/backup ./backup
```

### Restore Database
```bash
docker cp ./backup bar-national-mongodb:/backup

docker exec bar-national-mongodb mongorestore \
  -u admin -p password123 --authenticationDatabase admin \
  -d bar-national /backup/bar-national
```

## Connection String for External Tools

If you need to connect from other tools or applications:

```
mongodb://admin:password123@localhost:27017/bar-national?authSource=admin
```

## Security Notes

⚠️ **Important**: The credentials in this setup are for local development only. 

For production:
- Use strong, unique passwords
- Enable SSL/TLS encryption
- Use environment variables for credentials
- Restrict network access
- Enable MongoDB authentication
- Use role-based access control (RBAC)

---

**Need Help?** Check the main [README.md](./README.md) for more information about the project.

