import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tajlift.management',
  appName: 'Taj Lift',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    CapacitorSQLite: {
      androidIsEncrypted: false
    }
  }
};

export default config;
