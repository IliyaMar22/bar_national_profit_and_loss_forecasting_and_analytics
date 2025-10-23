import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['admin', 'user'] },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

let User;
let usersConnection = null;
let connectionPromise = null;

const connectUsersDB = async () => {
  // If already connected, return immediately
  if (usersConnection?.readyState === 1) {
    return usersConnection;
  }
  
  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }
  
  const MONGODB_USERS_URI = process.env.MONGODB_USERS_URI || 
    'mongodb://admin:password123@users-mongodb:27017/bar-national-users?authSource=admin';
  
  try {
    console.log('Connecting to users database...');
    connectionPromise = mongoose.createConnection(MONGODB_USERS_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).asPromise();
    
    usersConnection = await connectionPromise;
    console.log('✅ Connected to users database successfully');
    
    // Create or get the User model
    if (!usersConnection.models.User) {
      User = usersConnection.model('User', userSchema);
    } else {
      User = usersConnection.models.User;
    }
    
    connectionPromise = null;
    return usersConnection;
  } catch (error) {
    console.error('❌ Failed to connect to users database:', error);
    connectionPromise = null;
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectUsersDB();

    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, username, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Check user limit (max 3 users)
    const userCount = await User.countDocuments();
    if (userCount >= 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum of 3 users allowed'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      username,
      passwordHash,
      role: userCount === 0 ? 'admin' : 'user' // First user is admin
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
}
