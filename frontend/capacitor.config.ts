import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.ksp.manemanegepolice',
  appName: 'Mane Manege Police',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
