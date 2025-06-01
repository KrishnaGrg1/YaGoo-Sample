import AppButton from '@/components/Button'
import Input from '@/components/Input'
import axios from 'axios'
import { router } from 'expo-router'
import { Mail } from 'lucide-react-native'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ForgotPassword() {
    const [email, setEmail] = React.useState('')
    const [errors, setErrors] = React.useState<string[]>([])

    const handleForgetPassword = async () => {
        try {
            const userData = { email }
            const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
            console.log("IP Address:", IP_Address); // Debugging log
            const response = await axios.post(`http://${IP_Address}:8002/auth/forgotPassword`, userData)
            const data = response.data;
            console.log(data)
            router.replace({
                pathname: '/change-password',
                params: { email, message: `OTP sent to ${email}` },
            });
        } catch (error: any) {
            console.log("Full error:", error)

            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message)
                setErrors(errorMessages)
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message])
            } else {
                setErrors(["Something went wrong."])
            }
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>

            {errors.length > 0 && (
                <View style={styles.errorBox}>
                    {errors.map((err, i) => (
                        <Text key={i} style={styles.errorText}>• {err}</Text>
                    ))}
                </View>
            )}

            <Input
                icon={<Mail size={20} />}
                placeholder="Email"
                value={email}
                setValue={setEmail}
                keyboardType="email-address"
            />

            <AppButton title="Send OTP" onPress={handleForgetPassword} />
            <AppButton
                title="Return to Login"
                onPress={() => router.push('/login')}
                style={{ backgroundColor: 'transparent' }}
                textStyle={{ color: '#2196F3' }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    errorBox: {
        backgroundColor: '#ffe5e5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: '#b00020',
        fontSize: 14,
    },
})
