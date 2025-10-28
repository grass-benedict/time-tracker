import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './models/index.ts';
import userRoutes from './routes/userRoutes.ts';
import User from './models/user.ts';

dotenv.config();
const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. MAIN ROUTES ---
// Root route (for health check)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Time Tracking API is running successfully!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// User routes (mounted by the router)
app.use('/api/users', userRoutes);

// Single route to display all users (for testing)
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await User.findAll(); 
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});
// -----------------------

const PORT = process.env.PORT || 5000;

// --- 3. SERVER STARTUP LOGIC ---
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // This is run once the connection is verified
    await sequelize.sync(); 

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

// --- 4. EXECUTION ---
startServer();