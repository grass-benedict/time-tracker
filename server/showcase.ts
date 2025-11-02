import { Employee } from './models/sync.ts';

const employees = await Employee.findAll();
const manager = await Employee.findAll({
    where: {role: 'Manager'}
});
const managerList = await Employee.findAll({
    where: {role: 'Manager'},
    attributes: ['name', 'surname']
});

const employee = await Employee.findOne({
    where: {name: 'Maybell'}
});

//example comment

//console.log(employees);
//console.log(manager);
//console.log(managerList);
console.log(employee?.name);