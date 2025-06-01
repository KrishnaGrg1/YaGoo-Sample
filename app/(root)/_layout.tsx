// app/_layout.tsx or app/(root)/_layout.tsx
import { Stack } from 'expo-router';
import { LocationSetterProvider } from '@/components/LocationSetterContext';

const RootLayout = () => {
  return (
    <LocationSetterProvider>
      <Stack />
    </LocationSetterProvider>
  );
};

export default RootLayout;