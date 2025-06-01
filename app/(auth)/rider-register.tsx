import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Bike } from 'lucide-react-native';
import axios from 'axios';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import CustomImagePicker from '@/components/ImageInput';
import RNPickerSelect from 'react-native-picker-select';

export default function RiderRegistration() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');

  React.useEffect(() => {
    console.log("Email received in rider-register:", email);
  }, [email]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('');

  const [citizenshipNumber, setCitizenshipNumber] = useState('');

  // Images
  const [licensePhoto, setLicensePhoto] = useState('');
  const [citizenshipPhoto, setCitizenshipPhoto] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState('');
  const [vehicleNumberPlatePhoto, setVehicleNumberPlatePhoto] = useState('');
  const [vehicleBlueBookPhoto, setVehicleBlueBookPhoto] = useState('');

  const [errors, setErrors] = useState<string[]>([]);

  const handleRegister = async () => {
    if (!email) {
      setErrors(["Email is required. Please go back and try again."]);
      return;
    }
    try {
      const formData = new FormData();
      console.log("Form Data:", formData);
      formData.append('email', email);
      formData.append('licenseNumber', licenseNumber);
      formData.append('vehicleType', vehicleType);
      formData.append('vehicleName', vehicleName);
      formData.append('vehicleModel', vehicleModel);
      formData.append('vehicleNumberPlate', vehicleNumberPlate);
      formData.append('citizenshipNumber', citizenshipNumber);

      formData.append('licensePhoto', {
        uri: licensePhoto,
        type: 'image/jpeg',
        name: 'license.jpg',
      } as any);

      formData.append('citizenshipPhoto', {
        uri: citizenshipPhoto,
        type: 'image/jpeg',
        name: 'citizenship.jpg',
      } as any);

      formData.append('vehiclePhoto', {
        uri: vehiclePhoto,
        type: 'image/jpeg',
        name: 'vehicle.jpg',
      } as any);

      formData.append('vehicleNumberPlatePhoto', {
        uri: vehicleNumberPlatePhoto,
        type: 'image/jpeg',
        name: 'numberPlate.jpg',
      } as any);

      formData.append('vehicleBlueBookPhoto', {
        uri: vehicleBlueBookPhoto,
        type: 'image/jpeg',
        name: 'bluebook.jpg',
      } as any);

      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log("IP Address:", IP_Address); // Debugging log

      const response = await axios.post(
        `http://${IP_Address}:8002/auth/register-rider`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.data;
      console.log(data);

      router.replace({
        pathname: '/verify-email',
        params: { email: email, message: `OTP sent to ${email}` },
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
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <Text style={styles.title}>Register as a Rider</Text>

      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      <Input icon={<BadgeCheck size={20} />} placeholder="License Number" value={licenseNumber} setValue={setLicenseNumber} />

      {/* Citizenship Number Input */}
      <Input
        icon={<BadgeCheck size={20} />}
        placeholder="Citizenship Number"
        value={citizenshipNumber}
        setValue={setCitizenshipNumber}
      />

      <CustomImagePicker
        label="License Photo"
        selectedImageUri={licensePhoto}
        onImageSelect={setLicensePhoto}
        containerStyle={styles.fullWidth}
      />
      <CustomImagePicker
        label="Citizenship Photo"
        selectedImageUri={citizenshipPhoto}
        onImageSelect={setCitizenshipPhoto}
        containerStyle={styles.fullWidth}
      />
      <RNPickerSelect
        onValueChange={(value) => setVehicleType(value)}
        placeholder={{ label: 'Select Vehicle Type', value: '' }}
        items={[
          { label: 'Bike', value: 'bike' },
          { label: 'Car', value: 'car' },
          { label: 'Scooter', value: 'scooter' },
          { label: 'Other', value: 'other' },
        ]}
        style={{
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
        }}
        Icon={() => <Bike size={20} color="#666" style={{ marginRight: 10 }} />}
      />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Name" value={vehicleName} setValue={setVehicleName} />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Model" value={vehicleModel} setValue={setVehicleModel} />

      {/* Vehicle Number Plate Input */}
      <Input
        icon={<Bike size={20} />}
        placeholder="Vehicle Number Plate"
        value={vehicleNumberPlate}
        setValue={setVehicleNumberPlate}
      />

      <CustomImagePicker
        label="Vehicle Photo"
        selectedImageUri={vehiclePhoto}
        onImageSelect={setVehiclePhoto}
        containerStyle={styles.fullWidth}
      />
      <CustomImagePicker
        label="Vehicle Number Plate Photo"
        selectedImageUri={vehicleNumberPlatePhoto}
        onImageSelect={setVehicleNumberPlatePhoto}
        containerStyle={styles.fullWidth}
      />
      <CustomImagePicker
        label="Vehicle Blue Book Photo"
        selectedImageUri={vehicleBlueBookPhoto}
        onImageSelect={setVehicleBlueBookPhoto}
        containerStyle={styles.fullWidth}
      />

      <AppButton title="Register as Rider" onPress={handleRegister} style={styles.fullWidth} />
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={StyleSheet.flatten([styles.fullWidth, { backgroundColor: 'transparent' }])}
        textStyle={{ color: '#2196F3' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    paddingVertical: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: '#d9534f',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  picker: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  fullWidth: {
    width: '100%',
    marginBottom: 20,
  },
});
