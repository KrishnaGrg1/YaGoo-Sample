import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="VerifyOtpScreen" options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="CompleteRideScreen" options={{ title: 'Complete Ride' }} />
      <Stack.Screen name="ReviewScreen" options={{ title: 'Submit Review' }} />
      <Stack.Screen name="PaymentConfirmationScreen" options={{ title: 'Payment Confirmation' }} />
      <Stack.Screen name="ChatScreen" options={{ title: 'Chat' }} />
    </Stack>
  );
}