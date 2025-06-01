import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import Input from '@/components/Input';
import { KeyRound, Mail, Phone } from 'lucide-react-native';
import AppButton from '@/components/Button';

import { storeSession } from '@/usableFunction/Session';
import { OtpInput } from 'react-native-otp-entry';

export default function ChangePassword() {
    const { email } = useLocalSearchParams();
    const [OTP, setOtp] = useState('');
    const [password, setPassword] = useState('')
    const [retypepassword, setRetypePassword] = useState('')
    const [errors, setErrors] = useState<string[]>([]);

    const handleChangePassword = async () => {
        if (password !== retypepassword) {
            Alert.alert("Error", "Passwords do not match");
            setErrors(["Passwords do not match"]);
            return
        }
        try {

            const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
            console.log("IP Address:", IP_Address); // Debugging log
            const response = await axios.post(`http://${IP_Address}:8002/auth/changePassword`, {
                email,
                OTP,
                password
            });

            const data = await response.data;
            console.log(data);
            await storeSession('accessToken', String(data.token));

            router.replace({
                pathname: '/(root)/(tabs)/home',
                params: { message: 'Change Password successfully!' }
            });
        } catch (error: any) {
            console.log("Full error:", error);

            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message);
                setErrors(errorMessages);
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]); // fallback if message is provided
            } else {
                setErrors(["Something went wrong."]);
            }
        }

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>We’ve sent an OTP to: {email}</Text>

            {errors.length > 0 && errors.map((err, i) => (
                <Text key={i} style={styles.error}>{err}</Text>
            ))}


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

            <Input
                icon={<KeyRound size={20} />}
                placeholder="New Password.."
                value={password}
                setValue={setPassword}
                secureTextEntry
            />
            <Input
                icon={<KeyRound size={20} />}
                placeholder="Retype Password.."
                value={retypepassword}
                setValue={setRetypePassword}
                secureTextEntry
            />



            <AppButton title="Change Password" onPress={handleChangePassword} />
            <AppButton
                title="Already have an account? Login"
                onPress={() => router.push('/login')}
                style={{ backgroundColor: 'transparent' }}
                textStyle={{ color: '#2196F3' }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, marginTop: 100 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    error: { color: 'red', marginBottom: 15, textAlign: 'center' },
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
