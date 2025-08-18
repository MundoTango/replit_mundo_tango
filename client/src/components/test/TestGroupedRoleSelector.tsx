import React from 'react';
import GroupedRoleSelector from '../profile/GroupedRoleSelector';

export default function TestGroupedRoleSelector() {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Grouped Role Selector</h1>
      <GroupedRoleSelector 
        selectedRoles={selectedRoles}
        onRoleChange={setSelectedRoles}
        allowMultiple={true}
      />
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Selected Roles:</h3>
        <pre>{JSON.stringify(selectedRoles, null, 2)}</pre>
      </div>
    </div>
  );
}