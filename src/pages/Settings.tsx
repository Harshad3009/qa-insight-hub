import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeysTab } from '@/components/settings/ApiKeysTab';
import { Settings as SettingsIcon, Key } from 'lucide-react';

export default function Settings() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your project configuration and integrations.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="api-keys" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="api-keys" className="gap-2">
                            <Key className="w-4 h-4" />
                            API Keys
                        </TabsTrigger>
                        {/* Future tabs: Notifications, Team Members, etc. */}
                    </TabsList>

                    <TabsContent value="api-keys" className="space-y-4">
                        <ApiKeysTab />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}