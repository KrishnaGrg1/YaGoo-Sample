import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AppButton from '../Button';
import { ArrowRightLeft } from 'lucide-react-native';

interface SwitchRoleFormProps {
  currentRole: string;
  onSwitch: () => void;
  onCancel: () => void;
}

const SwitchRoleForm: React.FC<SwitchRoleFormProps> = ({
  currentRole,
  onSwitch,
  onCancel,
}) => {
  const targetRole = currentRole === 'customer' ? 'rider' : 'customer';

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Switch Role</Text>
      <Text style={styles.description}>
        You are currently a <Text style={styles.highlight}>{currentRole}</Text>.
        Would you like to switch to <Text style={styles.highlight}>{targetRole}</Text> mode?
      </Text>
      
      <View style={styles.buttonContainer}>
        <AppButton
          title={`Switch to ${targetRole}`}
          onPress={onSwitch}
          Icon={ArrowRightLeft}
          iconColor="#FFF"
          iconSize={24}
          style={styles.switchButton}
          textStyle={styles.buttonText}
        />
        
        <AppButton
          title="Cancel"
          onPress={onCancel}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  buttonContainer: {
    gap: 12,
  },
  switchButton: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwitchRoleForm;