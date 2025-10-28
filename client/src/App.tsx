/* import { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')  // Uses proxy from package.json
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <ul>
        {users.length === 0 ? (
          <li>Loading...</li>
        ) : (
          users.map(u => <li key={u.id}>{u.name}</li>)
        )}
      </ul>
    </div>
  );
}

export default App; */
import React, { useState } from 'react';
import { Clock, Calendar, TrendingUp, BarChart3, Settings, Briefcase, Umbrella, LayoutDashboard, Play, Bell, ChevronDown, MoreVertical, Plus } from 'lucide-react';

export default function TimeTrackerDashboard() {
  const [currentProject, setCurrentProject] = useState('E-commerce Platform Redesign');
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TimeTracker</h1>
              <p className="text-sm text-gray-500">Employee Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5" />
              Time Entries
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5" />
              Projects
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Umbrella className="w-5 h-5" />
              Vacation Requests
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              Reports
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
              alt="Sarah Johnson"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Software Developer</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Good morning, Sarah! 👋</h2>
            <p className="text-gray-600">Ready to start tracking your time today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="font-bold">October 25, 2025</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Clock In Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Ready to work</h3>
                  <p className="text-gray-600 mb-6">Select a project and start tracking your time</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Project
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currentProject}
                        onChange={(e) => setCurrentProject(e.target.value)}
                        className="w-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Clock In
                  </button>
                </div>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold">00:00:00</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-sm text-gray-700 font-medium mt-2">Total hours worked</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Flex Account */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg">Flex Account</h3>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-1">+12.5h</div>
                <p className="text-sm text-gray-500">Overtime balance</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">This month:</span>
                <span className="font-semibold text-green-600">+8.2h</span>
              </div>
            </div>

            {/* March Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg">March Summary</h3>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours worked</span>
                  <span className="font-semibold">128.5h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected</span>
                  <span className="font-semibold">120.0h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difference</span>
                  <span className="font-semibold text-green-600">+8.5h</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '107%' }}></div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Clocked out</p>
                    <p className="text-xs text-gray-500">Yesterday, 5:30 PM</p>
                  </div>
                  <span className="text-sm font-semibold">8.5h</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Project changed</p>
                    <p className="text-xs text-gray-500">Yesterday, 2:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Break ended</p>
                    <p className="text-xs text-gray-500">Yesterday, 1:00 PM</p>
                  </div>
                  <span className="text-sm font-semibold">30m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vacation Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Vacation Requests</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>

            <div className="space-y-3">
              {/* Pending Request */}
              <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Umbrella className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Summer Vacation</p>
                  <p className="text-sm text-gray-600">July 15-29, 2024 • 10 days</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  Pending
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Approved Request */}
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Long Weekend</p>
                  <p className="text-sm text-gray-600">March 29-31, 2024 • 3 days</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Approved
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Denied Request */}
              <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">✕</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Conference Days</p>
                  <p className="text-sm text-gray-600">February 20-22, 2024 • 3 days</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                  Denied
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}