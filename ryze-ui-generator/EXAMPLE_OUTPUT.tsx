import React, { useState } from 'react';
import { Button, Card, Input, Table, Modal, Navbar } from './ComponentLibrary';

export default function ExampleDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const metricsData = [
    ['Revenue', '$45,231'],
    ['Users', '1,234'],
    ['Growth', '+12.5%']
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        title="Dashboard"
        items={[
          { label: 'Settings', onClick: () => setIsModalOpen(true) },
          { label: 'Profile', onClick: () => {} }
        ]}
      />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card title="Total Revenue" variant="elevated">
            <p className="text-3xl font-bold text-gray-900">$45,231</p>
            <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
          </Card>
          
          <Card title="Active Users" variant="elevated">
            <p className="text-3xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-blue-600 mt-2">+8.2% from last week</p>
          </Card>
          
          <Card title="Conversion Rate" variant="elevated">
            <p className="text-3xl font-bold text-gray-900">3.24%</p>
            <p className="text-sm text-purple-600 mt-2">+0.8% from last month</p>
          </Card>
        </div>
        
        <Card title="Recent Activity" subtitle="Last 30 days">
          <Table 
            headers={['Metric', 'Value']}
            rows={metricsData}
            striped={true}
          />
        </Card>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Settings"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
          <Input 
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </Modal>
    </div>
  );
}

// This is an example of what the AI generates
// Key features:
// 1. Only uses allowed components from ComponentLibrary
// 2. No inline styles or custom CSS
// 3. Clean, readable React code
// 4. Proper state management with hooks
// 5. Responsive layout using Tailwind utility classes (only those built into components)
