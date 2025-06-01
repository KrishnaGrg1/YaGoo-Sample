import { Lock } from 'lucide-react-native';
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Input from './Input';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  Icon?: React.ComponentType<any>;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  Icon,
  iconColor = '#fff',
  iconSize = 24,
  disabled = false,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}
      disabled={disabled}>
      <View style={styles.content}>
        {Icon && <Icon size={iconSize} color={iconColor} style={styles.icon} />}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Gray color for disabled state
  },
});

export default AppButton;



