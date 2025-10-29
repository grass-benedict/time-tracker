import { faker } from '@faker-js/faker';
import { sequelize, Employee, TimeLog, StatusLog } from './models/sync.ts';

function formatDate(date:Date): Date{
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

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
    const createdEmployees = await Employee.findAll({ raw: true });
    console.log(createdEmployees.map(e => e.id));
    console.log('Seeded 50 dummy rows');

    // dummyTimeLogs array. Any size
    const dummyTimeLogs: any[] = [];

    // For each employee, create 5-10 random time logs
    for (const emp of createdEmployees){
      const logsCount = faker.number.int({ min: 5, max: 10 });
      for (let i = 0; i < logsCount; i++) {
        dummyTimeLogs.push({
          employeeId: emp.id,
          clockTime: new Date(faker.date.recent({ days: 14 }).setMilliseconds(0)), // random dates+times for last 14 days
          eventType: faker.helpers.arrayElement(['IN', 'OUT']),
        });
      }
    }

    await TimeLog.bulkCreate(dummyTimeLogs);
    console.log(`Seeded ${dummyTimeLogs.length} logs`);

    const today = new Date();
    today.setHours(0,0,0,0);

    // Only taking a quarter of the employees. 
    const quarterEmployees = createdEmployees.slice(0, Math.floor(createdEmployees.length / 4));

    // Any size dummyStatusLogs array
    const dummyStatusLogs: any[] = [];

    // For each employee create a status entry
    for (const emp of quarterEmployees) {
      // Generate a random start date within the last 14 days
      const start = faker.date.recent ({ days:14 });

      const minEnd = start > today ? start : today;
      const end = new Date(minEnd);
      end.setDate(minEnd.getDate() + faker.number.int({ min: 1, max: 10 }));

      dummyStatusLogs.push({
        employeeId: emp.id,
        statusType: faker.helpers.arrayElement(['SICK', 'VACATION']),
        startDate: formatDate(start),
        endDate: formatDate(end),
        notes: faker.lorem.sentence(),
      })
    }

    await StatusLog.bulkCreate(dummyStatusLogs);

  }catch(err){
    console.error('failed to seed:', err);
    // finally is needed in order to close instance
  } finally {
    await sequelize.close();
    console.log('db connection closed');
  }
}

seed();