import { faker } from '@faker-js/faker';
import { sequelize, Employee } from './models/sync.ts';

async function seed() {
  try{
    await sequelize.authenticate();
    console.log("db connected");

    await sequelize.sync({alter: true});
    console.log('db synced');

    const dummyEmployees = Array.from({ length: 50 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Generate username: first 2 letters of first name + first 2 letters of surname + 2-digit number
      const username =
        firstName.slice(0, 2).toLowerCase() +
        lastName.slice(0, 2).toLowerCase() +
        String(faker.number.int({ min: 10, max: 99 }));

      return {
        name: firstName,
        surname: lastName,
        username: username,
        password: 'password123', // default password
        vacationDays: faker.number.int({ min: 0, max: 30 }),
        flexAccount: faker.number.float({ min: 0, max: 20, fractionDigits: 1 }),
        role: faker.helpers.arrayElement(['Manager', 'HR', 'default']),
      };
    });

    await Employee.bulkCreate(dummyEmployees);
    console.log('Seeded 50 dummy rows');
  }catch(err){
    console.error('failed to seed:', err);
    // finally is needed in order to close instance
  } finally {
    await sequelize.close();
    console.log('db connection closed');
  }
}

seed();