import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import AppButton from '@/components/Button';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS; 

const VerifyOtpScreen = ({ route }: any) => {
 
  const {  email, rideId  } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const router = useRouter();
const [errors, setErrors] = useState<string[]>([]);
  const handleVerifyOtp = async () => {
    if (!otp) {
      return Alert.alert('Please enter the OTP');
    }

    try {
      console.log('Ride ID:', rideId);
      console.log('Rider Email:', email);
      console.log('OTP:', otp);
      const token = await getSession('accessToken');
      console.log('Sending payload:', { email, rideId, riderOtp: otp });
      console.log('Token:', token);
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/verify-ride-otp`,
        { email, rideId, riderOtp: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('OTP verification response:', response.data);
      Alert.alert(response.data.message || 'OTP verified successfully');
      router.push({
        pathname: '/(root)/(rides)/CompleteRideScreen',
        params: { rideId },
      });
    } catch (error: any) {
      console.log('Full error:', error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Verify OTP</Text>
      {errors.length > 0 && (
        <View>
          {errors.map((error, index) => (
            <Text key={index} style={{ color: 'red', textAlign: 'center' }}>
              {error}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.subtitle}>Enter the OTP sent to the rider's email to start the ride.</Text>

      <OtpInput
        numberOfDigits={6}
        focusColor="green"
        autoFocus={false}
        hideStick={true}
        placeholder="******"
        blurOnFilled={true}
        disabled={false}
        type="numeric"
        secureTextEntry={false}
        focusStickBlinkingDuration={500}
        onFocus={() => console.log("Focused")}
        onBlur={() => console.log("Blurred")}
        onTextChange={(text) => setOtp(text)}
        onFilled={(text) => {
          console.log(`OTP is ${text}`);
          setOtp(text);
        }}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        textProps={{
          accessibilityRole: "text",
          accessibilityLabel: "OTP digit",
          allowFontScaling: false,
        }}
        theme={{
          containerStyle: styles.container,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.activePinCodeContainer,
          placeholderTextStyle: styles.placeholderText,
          filledPinCodeContainerStyle: styles.filledPinCodeContainer,
          disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
        }}
      />

      <AppButton title="Verify OTP" onPress={handleVerifyOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  container: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCodeText: {
    fontSize: 18,
    color: '#000',
  },
  focusStick: {
    height: 2,
    width: '100%',
    backgroundColor: 'green',
  },
  activePinCodeContainer: {
    borderColor: 'green',
  },
  placeholderText: {
    color: '#aaa',
  },
  filledPinCodeContainer: {
    backgroundColor: '#e6ffe6',
  },
  disabledPinCodeContainer: {
    backgroundColor: '#f0f0f0',
  },
});

export default VerifyOtpScreen;
