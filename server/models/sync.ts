import sequelize from "../config/database.ts";
import Employee from "./employee.ts";
import TimeLog from "./timeLog.ts";
import LeaveRequest from "./leaveRequest.ts";

const isDev = true;
// EMPLOYEE -> EMPLOYEE (manager relationship)
Employee.hasMany(Employee,{
    as:'subordinates', // alias for manager.subordinates
    foreignKey: 'managerId',
});
Employee.belongsTo(Employee, {
    as: 'manager', // alias for employee.manager
    foreignKey: 'managerId',
});

// EMPLOYEE -> TIME LOG
Employee.hasMany(TimeLog, {
    as: "timeLogs", // epmloyee.timeLogs
    foreignKey: "employeeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
TimeLog.belongsTo(Employee, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})

// EMPLOYEE -> LEAVE REQUEST
Employee.hasMany(LeaveRequest, {
    as: "leaveRequests", //employee.leaveRequests
    foreignKey: "employeeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
TimeLog.belongsTo(Employee, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// APPROVER (Manager/Admin) -> LEAVE REQUESTS
Employee.hasMany(TimeLog, {
    as: "approvedRequests", // manager.approvedRequests
    foreignKey: "approvedBy",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
TimeLog.belongsTo(Employee, {
    as:"approver", // leaveRequest.approver
    foreignKey: "approvedBy",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
const syncModels = async () => {
    try {
        if (isDev){
            await sequelize.sync({ force: true })
        } else {
            await sequelize.sync({ alter: true })
        }
        console.log("All models synced successfully");
    } catch (err){
        console.error("Error syncing models:", err);
    }
};

export { sequelize, Employee, TimeLog, LeaveRequest ,syncModels };