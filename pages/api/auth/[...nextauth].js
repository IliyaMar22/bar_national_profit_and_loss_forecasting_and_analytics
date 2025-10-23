import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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

// Connect to users database
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
    connectionPromise = null;
    return usersConnection;
  } catch (error) {
    console.error('❌ Failed to connect to users database:', error);
    connectionPromise = null;
    throw error;
  }
};

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('Attempting to authorize user:', credentials.email);
          
          const conn = await connectUsersDB();
          
          // Check if model already exists on this connection
          if (!User || !conn.models.User) {
            User = conn.model('User', userSchema);
          } else {
            User = conn.models.User;
          }
          
          console.log('Connected to users database, searching for user...');
          
          const user = await User.findOne({ 
            email: credentials.email,
            isActive: true 
          });

          console.log('User found:', user ? 'Yes' : 'No');

          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }

          console.log('Comparing password...');
          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.passwordHash
          );

          console.log('Password valid:', isValidPassword);

          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid password');
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, { 
            lastLogin: new Date() 
          });

          console.log('Login successful for user:', credentials.email);
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'bar-national-secret-key-2024',
  debug: process.env.NODE_ENV === 'development'
});
