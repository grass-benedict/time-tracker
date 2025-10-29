// BEFORE (or what might be in your file)
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ 
    path: './server/models/.env'
});


//Hardcoded because otherwise there will be an error with TS
//TODO: Find out why
const sequelize = new Sequelize(
  // 1. Database Name
  "time_tracker",
  
  // 2. Database Username
  "admin",
  
  // 3. Database Password (THIS IS WHAT WAS MISSING)
  "0212",
  
  // 4. Options Object
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;