import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './models/index.ts';
import userRoutes from './routes/userRoutes.ts';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Time Tracking API is running successfully!',
    environment: process.env.NODE_ENV || 'development'
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync(); // { force: true } to recreate tables

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

startServer();
