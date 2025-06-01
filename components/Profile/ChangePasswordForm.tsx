// components/ChangePasswordForm.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { Lock } from 'lucide-react-native';

interface Props {
  currentpassword: string;
  setcurrentPassword: (val: string) => void;
  newpassword: string;
  setnewPassword: (val: string) => void;
  onChange: () => void;
  onCancel: () => void;
}

export default function ChangePasswordForm({
  currentpassword,
  setcurrentPassword,
  newpassword,
  setnewPassword,
  onChange,
  onCancel,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Input icon={<Lock size={20} />} placeholder="Current Password" value={currentpassword} setValue={setcurrentPassword} secureTextEntry />
      <Input icon={<Lock size={20} />} placeholder="New Password" value={newpassword} setValue={setnewPassword} secureTextEntry />
      <AppButton title="Change Password" onPress={onChange} />
      <AppButton title="Back to Profile" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,  
      justifyContent: 'center',  
      alignItems: 'center',  
      padding: 20,
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
  });
  
