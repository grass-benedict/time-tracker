import sequelize from './models/index.js';
import User from './models/user.js';

async function seed() {
  try {
    await sequelize.sync({ force: true }); // Drops and recreates tables

    // Sample data
    const users = [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'David' },
    ];

    for (const u of users) {
      await User.create(u);
    }

    console.log('✅ Sample data added successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
