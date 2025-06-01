// components/EditProfileForm.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';

interface Props {
  fullname: string;
  setFullname: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditProfileForm({ fullname, setFullname, phone, setPhone, onSave, onCancel }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Input placeholder="Full Name" value={fullname} setValue={setFullname} />
      <Input placeholder="Phone Number" value={phone} setValue={setPhone} keyboardType="phone-pad" />
      <AppButton title="Save Changes" onPress={onSave} />
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
