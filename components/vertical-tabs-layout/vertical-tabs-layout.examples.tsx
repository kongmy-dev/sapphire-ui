import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs.js';

function VerticalTabsSettings() {
  return (
    <Tabs
      className="sp-vertical-tabs-layout"
      orientation="vertical"
      defaultValue="profile"
    >
      <TabsList aria-label="Settings sections" variant="pills">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <h2>Profile settings</h2>
        <a href="#profile-details">Edit profile</a>
      </TabsContent>
      <TabsContent value="security">
        <h2>Security settings</h2>
        <a href="#security-details">Review security</a>
      </TabsContent>
    </Tabs>
  );
}

export const examples = [
  { name: 'settings', render: VerticalTabsSettings },
] as const;
