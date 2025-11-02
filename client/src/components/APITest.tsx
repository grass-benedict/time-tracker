import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  surname: string;
  username: string;
  vacationDays: number;
  flexAccount: number;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export function APITest() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string>('');
  const [testEmployee, setTestEmployee] = useState<Employee | null>(null);

  // Test GET all employees (use the router-mounted path)
  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employee');
      if (!response.ok) {
        // try to read JSON error details if present
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errBody = await response.json();
          throw new Error(errBody.message || JSON.stringify(errBody));
        }
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.slice(0, 200)}`);
      }
      const data = await response.json();
      setEmployees(data);
      console.log('All employees:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching employees:', message);
    }
  };

  // Test POST new employee
  const createEmployee = async () => {
    try {
      const newEmployee = {
        name: 'Test',
        surname: 'User',
        username: 'testuser',
        password: 'password123',
        vacationDays: 25,
        flexAccount: 0,
        role: 'employee'
      };

      const response = await fetch('http://localhost:5000/api/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) throw new Error('Failed to create employee');
      const data = await response.json();
      setTestEmployee(data);
      console.log('Created employee:', data);
      fetchAllEmployees(); // Refresh the list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error creating employee:', message);
    }
  };

  // Test GET single employee
  const fetchSingleEmployee = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employee/${id}`);
      if (!response.ok) throw new Error('Failed to fetch employee');
      const data = await response.json();
      console.log('Single employee:', data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching single employee:', message);
    }
  };

  // Test PUT update employee
  const updateEmployee = async (id: number) => {
    try {
      const updateData = {
        vacationDays: 30,
        flexAccount: 5
      };

      const response = await fetch(`http://localhost:5000/api/employee/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update employee');
      const data = await response.json();
      console.log('Updated employee:', data);
      fetchAllEmployees(); // Refresh the list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error updating employee:', message);
    }
  };

  // Test DELETE employee
  const deleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employee/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');
      const data = await response.json();
      console.log('Delete response:', data);
      fetchAllEmployees(); // Refresh the list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error deleting employee:', message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg">
      <h2 className="text-xl font-bold mb-4">API Testing Interface</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={fetchAllEmployees}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Fetch All Employees
        </button>

        <button
          onClick={createEmployee}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Create Test Employee
        </button>

        {testEmployee && (
          <>
            <button
              onClick={() => fetchSingleEmployee(testEmployee.id)}
              className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
            >
              Fetch Test Employee
            </button>

            <button
              onClick={() => updateEmployee(testEmployee.id)}
              className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
            >
              Update Test Employee
            </button>

            <button
              onClick={() => deleteEmployee(testEmployee.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Test Employee
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Employees List:</h3>
        <div className="space-y-2">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="p-2 border border-border rounded"
            >
              {employee.name} {employee.surname} ({employee.role})
              - Vacation Days: {employee.vacationDays}
              - Flex Account: {employee.flexAccount}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}