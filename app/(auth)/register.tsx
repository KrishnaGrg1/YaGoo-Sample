import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Lock, Mail, User, Phone, BadgeCheck, Bike } from 'lucide-react-native';
import axios from 'axios';
import Input from '@/components/Input';
import AppButton from '@/components/Button';



export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);


  const handleRegister = async () => {
    try {
      const userData: any = {
        email,
        password,
        fullname,
        phone,
      };
      if (!email || !password || !fullname || !phone) {
        alert("Please fill up all the details.");
        return;
      }
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log("IP Address:", IP_Address); // Debugging log
      const response = await axios.post(`http://${IP_Address}:8002/auth/register`, userData);
      const data = await response.data;
      console.log(data);

      router.replace({
        pathname: "/switch-role",
        params: { email: email}
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
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>

      <Text style={styles.title}>Create Account</Text>

      {/* Show errors if any */}
      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      {/* Shared Inputs */}
      <Input icon={<Mail size={20} />} placeholder="Email" value={email} setValue={setEmail} keyboardType="email-address" />
      <Input icon={<Lock size={20} />} placeholder="Password" value={password} setValue={setPassword} secureTextEntry />
      <Input icon={<User size={20} />} placeholder="Full Name" value={fullname} setValue={setFullname} />
      <Input icon={<Phone size={20} />} placeholder="Phone" value={phone} setValue={setPhone} keyboardType="phone-pad" />



      <AppButton title="Register" onPress={handleRegister} style={styles.fullWidth} />
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },

});
