'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.js';

function TabsOverview() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Project overview</TabsContent>
      <TabsContent value="activity">Recent project activity</TabsContent>
    </Tabs>
  );
}

function TabsControlled() {
  const [value, setValue] = useState('profile');
  return (
    <Tabs
      value={value}
      onValueChange={setValue}
      orientation="vertical"
      activationMode="manual"
    >
      <TabsList aria-label="Account sections" variant="pills">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Profile preferences</TabsContent>
      <TabsContent value="security">Security preferences</TabsContent>
    </Tabs>
  );
}

export const examples = [
  { name: 'overview', render: TabsOverview },
  { name: 'controlled', render: TabsControlled },
] as const;
