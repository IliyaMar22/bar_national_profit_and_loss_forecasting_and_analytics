// MongoDB initialization script
// Creates the database and user for the Bar National application

db = db.getSiblingDB('bar-national');

// Create a user for the application
db.createUser({
  user: 'bar-national-user',
  pwd: 'bar-national-password',
  roles: [
    {
      role: 'readWrite',
      db: 'bar-national'
    }
  ]
});

// Create collections with proper indexes
db.createCollection('dailyreports');

// Create indexes for better performance
db.dailyreports.createIndex({ "date": 1 }, { unique: true });
db.dailyreports.createIndex({ "created_at": 1 });
db.dailyreports.createIndex({ "revenues.general": 1 });

print('MongoDB initialization completed successfully!');
print('Database: bar-national');
print('User: bar-national-user');
print('Collections: dailyreports');
