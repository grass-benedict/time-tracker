import { SystemStatistics } from './SystemStatistics';
import { MasterDataForm } from './MasterDataForm';
import { SickLeaveForm } from './SickLeaveForm';
import { HierarchyView } from './HierarchyView';
import EmployeeMasterTable from './EmployeeMasterTable';


export function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">Welcome back, Julia 👋</h1>
          <p className="text-muted-foreground">HR Dashboard - Manage employees and organizational data</p>
        </div>
      </div>

      <SystemStatistics />

      {/* New Hierarchy View */}
      <HierarchyView />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MasterDataForm />
        <SickLeaveForm />
      </div>

       <EmployeeMasterTable />
    </div>
  );
}
