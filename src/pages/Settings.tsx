import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will include app configuration options, user preferences, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;