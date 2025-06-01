import React from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';

type InputProps = {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  setValue: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  error?: string;
  editable?: boolean;
};

export default function Input({
  icon,
  placeholder,
  value,
  setValue,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  editable = true,
}: InputProps) {
  return (
    <View style={[styles.inputContainer, error && styles.inputError]}>
      {icon}
      <TextInput
        placeholderTextColor="#888"
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
      marginTop: 40,
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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    inputError: {
      borderColor: '#e74c3c',
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    error: {
      color: 'red',
      marginBottom: 15,
      textAlign: 'center',
    },
    link: {
      color: '#007AFF',
      textAlign: 'center',
      marginTop: 15,
      marginBottom: 30,
    },
  });
  