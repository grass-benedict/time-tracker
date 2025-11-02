import { faker } from '@faker-js/faker';
import { sequelize, Employee, TimeLog, LeaveRequest } from './models/sync.ts';

// Department list — "Executive" reserved for super admin
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const EXECUTIVE_DEPARTMENT = 'Executive';

// Utility to zero out time
function truncateDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ force: true }); // fresh reset for dev
    console.log('✅ Database synced.');

    /* =========================================================
       1️⃣ Create one Super Admin (Executive)
       ========================================================= */
    const superManager = await Employee.create({
      name: 'Alice',
      surname: 'Anderson',
      username: 'admin01',
      password: 'adminpass',
      department: EXECUTIVE_DEPARTMENT,
      vacationDays: 30,
      vacationDaysUsed: 0,
      vacationDaysPending: 0,
      flexAccount: 0,
      flexMonthly: 0,
      role: 'admin',
      hoursMonthly: 160,
      hoursWorked: 0,
    });

    console.log(`👑 Created super manager: ${superManager.name}`);

    // Create more employees
    const employeesData = Array.from({ length: 99 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username =
        firstName.slice(0, 2).toLowerCase() +
        lastName.slice(0, 2).toLowerCase() +
        faker.number.int({ min: 10, max: 99 });

      return {
        name: firstName,
        surname: lastName,
        username,
        password: 'password123',
        department: faker.helpers.arrayElement(DEPARTMENTS),
        vacationDays: faker.number.int({ min: 20, max: 30 }),
        vacationDaysUsed: faker.number.int({ min: 0, max: 10 }),
        vacationDaysPending: faker.number.int({ min: 0, max: 5 }),
        flexAccount: faker.number.float({ min: 0, max: 20, fractionDigits: 1 }),
        flexMonthly: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
        role: faker.helpers.arrayElement(['employee', 'manager', 'hr']),
        hoursMonthly: 160,
        hoursWorked: faker.number.float({ min: 100, max: 160, fractionDigits: 1 }),
        managerId: null,
      };
    });

    const createdEmployees = await Employee.bulkCreate(employeesData, { returning: true });
    console.log(`👥 Seeded ${createdEmployees.length} employees.`);

    // Making sure each department has at least 1 manager
    for (const dept of DEPARTMENTS) {
      const managersInDept = createdEmployees.filter(
        (e) => e.role === 'manager' && e.department === dept
      );

      if (managersInDept.length === 0) {
        const fallbackManager = faker.helpers.arrayElement(
          createdEmployees.filter((e) => e.role === 'manager')
        );
        await fallbackManager.update({ department: dept });
        console.log(`🛠️  Assigned ${fallbackManager.name} as manager for ${dept}`);
      }
    }

    // Establishing hierarchy
    const managers = createdEmployees.filter((e) => e.role === 'manager');
    const hrs = createdEmployees.filter((e) => e.role === 'hr');
    const workers = createdEmployees.filter((e) => e.role === 'employee');

    // Managers report to super admin
    await Promise.all(managers.map((m) => m.update({ managerId: superManager.id })));

    // Build map of department → manager IDs
    const managersByDept: Record<string, number[]> = {};
    for (const m of managers) {
      (managersByDept[m.department] ??= []).push(m.id);
    }

    // HR → HR manager or super manager
    await Promise.all(
      hrs.map((hr) => {
        const hrManagers = managersByDept['HR'];
        const managerId = hrManagers?.length
          ? faker.helpers.arrayElement(hrManagers)
          : superManager.id;
        return hr.update({ managerId });
      })
    );

    // Employees → manager in same department (or fallback to super manager)
    await Promise.all(
      workers.map((emp) => {
        const deptManagers = managersByDept[emp.department];
        const managerId = deptManagers?.length
          ? faker.helpers.arrayElement(deptManagers)
          : superManager.id;
        return emp.update({ managerId });
      })
    );

    console.log('✅ Hierarchy established by department.');

    // Create Time Logs
    const timeLogsData: any[] = [];
    for (const emp of createdEmployees) {
      const logCount = faker.number.int({ min: 5, max: 10 });
      for (let i = 0; i < logCount; i++) {
        const date = faker.date.recent({ days: 14 });
        const inTime = new Date(
          date.setHours(
            faker.number.int({ min: 7, max: 9 }),
            faker.number.int({ min: 0, max: 59 }),
            0
          )
        );
        const outTime = new Date(inTime);
        outTime.setHours(inTime.getHours() + faker.number.int({ min: 6, max: 9 }));

        timeLogsData.push(
          { employeeId: emp.id, clockTime: inTime, eventType: 'IN' },
          { employeeId: emp.id, clockTime: outTime, eventType: 'OUT' }
        );
      }
    }
    await TimeLog.bulkCreate(timeLogsData);
    console.log(`🕒 Seeded ${timeLogsData.length} time logs.`);

    // Create Leave Requests
    const leaveRequestsData: any[] = [];
    const approvers = [superManager, ...managers];

    for (const emp of createdEmployees.slice(0, 15)) {
      const type = faker.helpers.arrayElement(['vacation', 'sick']);
      const start = faker.date.recent({ days: 20 });
      const end = new Date(start);
      end.setDate(start.getDate() + faker.number.int({ min: 1, max: 5 }));

      leaveRequestsData.push({
        employeeId: emp.id,
        type,
        startDate: truncateDate(start),
        endDate: truncateDate(end),
        approvedBy: faker.helpers.arrayElement(approvers).id,
        approvedStatus: faker.helpers.arrayElement(['pending', 'approved', 'denied']),
        note: faker.lorem.sentence(),
      });
    }

    await LeaveRequest.bulkCreate(leaveRequestsData);
    console.log(`📅 Seeded ${leaveRequestsData.length} leave requests.`);

    // Summary Log for Debugging
    console.log('\n📊 === Hierarchy Summary ===');
    for (const dept of DEPARTMENTS) {
      const mgrs = createdEmployees.filter(
        (e) => e.role === 'manager' && e.department === dept
      );
      const emps = createdEmployees.filter(
        (e) => e.role === 'employee' && e.department === dept
      );
      const hrsInDept = createdEmployees.filter(
        (e) => e.role === 'hr' && e.department === dept
      );
      console.log(
        `${dept}: ${mgrs.length} managers, ${hrsInDept.length} HR, ${emps.length} employees`
      );
    }

    console.log('\n✅ Seeding complete.');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  }
}

seed();
