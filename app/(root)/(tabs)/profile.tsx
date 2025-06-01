import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { clearSession, getSession } from '@/usableFunction/Session';
import axios from 'axios';
import { Edit2Icon, EditIcon, LogOut } from 'lucide-react-native';
import AppButton from '@/components/Button';
import Input from '@/components/Input';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';
import EditProfileForm from '@/components/Profile/EditProfileForm';
import ProfileInfoSection from '@/components/Profile/ProfileInfoSection';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import SwitchRoleForm from '@/components/Profile/SwitchRoleForm';
import DeleteProfile from '@/components/Profile/DeleteProfile';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [riderDocuments, setRiderDocuments] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [showChangePassword, setShowChangePassword] = useState(false); // State to toggle Change Password view
  const [showEditProfile, setShowEditProfile] = useState(false); // State to toggle Edit Profile view
  const [currentpassword, setcurrentPassword] = useState('');
  const [showdeleteprofile, setShowDeleteProfile] = useState(false)
  const [newpassword, setnewPassword] = useState('');
  const [showswitchRole, setSwitchRole] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

  const handleLogout = async () => {
    try {


      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log('IP Address:', IP_Address); // Debugging log
      const response = await axios.post(
        `http://${IP_Address}:8002/auth/logout`,

      );

      const message = response.data.message;
      console.log('Logout message:', message);

      // Clear the session
      await clearSession('accessToken');

      // Redirect to login
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.log('Full error:', error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = await getSession('accessToken');
      console.log('Fetched Token:', token); // Debugging log

      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      console.log('IP Address:', IP_Address); // Debugging log
      const response = await axios.get(`http://${IP_Address}:8002/profile/details`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add "Bearer" prefix
        },
      });
      const data = response.data;
      setRole(data.user.role);
      setFullname(data.user.fullname);
      setPhone(data.user.phone);
      setEmail(data.user.email);

      if (data.user.role === 'rider') {
        setRiderDocuments(data.user.riderDocuments || null);
        setVehicle(data.user.vehicle || null);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleRoleSwitch = async () => {
    try {
      const token = await getSession('accessToken');

      const response = await axios.post(
        `http://${IP_Address}:8002/profile/switch-role`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const details = response.data.details?.[0];

      if (details?.requiresRegistration) {
        Alert.alert(
          'Registration Required',
          'You must register as a rider first. Proceed to register?',
          [
            {
              text: 'Yes',
              onPress: () => router.push({
                pathname: '/(auth)/rider-register',
                params: { email },
              }),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      Alert.alert('Success', details?.message || 'Role switched');
      setRole(details?.currentRole);
      fetchUserDetails();
      setSwitchRole(false)
    } catch (error: any) {
      const status = error?.response?.status;
      const details = error?.response?.data?.details?.[0];

      const message = details?.message;
      const requiresRegistration = details?.requiresRegistration;

      if (requiresRegistration) {
        Alert.alert(
          'Registration Required',
          'You must register as a rider first. Proceed to register?',
          [
            {
              text: 'Yes',
              onPress: () => router.push({
                pathname: '/(auth)/rider-register',
                params: { email },
              }),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      if (status === 401) {
        Alert.alert('Unauthorized', 'Please log in again.');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Error', message || 'Failed to switch role.');
      }
    }
  };


  const handleSaveProfile = async () => {
    try {
      const token = await getSession('accessToken');
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      const response = await axios.put(
        `http://${IP_Address}:8002/profile/edit`,
        { fullname, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Profile updated:', response.data);
      alert('Profile updated successfully!');
      setShowEditProfile(false); // Go back to Profile view
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  const handleChangePassword = async () => {
    try {
      const token = await getSession('accessToken');
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      const response = await axios.put(
        `http://${IP_Address}:8002/profile/changePassword`,
        { oldPassword: currentpassword, newPassword: newpassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Password changed:', response.data);
      alert('Password changed successfully!');
      setShowChangePassword(false); // Go back to Profile view
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getSession('accessToken');

              const response = await axios.delete(`http://${IP_Address}:8002/profile/deleteProfile`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = response.data;

              if (data?.message) {
                Alert.alert('Success', data.message);
                router.push('/(auth)/login');
              } else {
                setErrors(['Unexpected response from server.']);
              }

            } catch (error: any) {
              console.log('Full error:', error);

              if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message);
                setErrors(errorMessages);
              } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]);
              } else {
                setErrors(['Something went wrong. Please try again later.']);
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      {showChangePassword ? (
        <ChangePasswordForm
          currentpassword={currentpassword}
          setcurrentPassword={setcurrentPassword}
          newpassword={newpassword}
          setnewPassword={setnewPassword}
          onChange={handleChangePassword}
          onCancel={() => setShowChangePassword(false)}
        />
      ) : showswitchRole ? (
        <SwitchRoleForm
          currentRole={role || 'customer'}
          onSwitch={handleRoleSwitch}
          onCancel={() => setSwitchRole(false)}
        />
      ) : showdeleteprofile ? (
        <DeleteProfile
          title='Delete Profile'
          onDelete={handleDeleteProfile}
          onCancel={() => setShowDeleteProfile(false)}
        />
      )
        : showEditProfile ? (
          <EditProfileForm
            fullname={fullname}
            setFullname={setFullname}
            phone={phone}
            setPhone={setPhone}
            onSave={handleSaveProfile}
            onCancel={() => setShowEditProfile(false)}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            <ProfileHeader fullname={fullname} email={email} />
            <ProfileInfoSection role={role as string} phone={phone} riderDocuments={riderDocuments} vehicle={vehicle} />

            <AppButton
              title="Edit Profile"
              onPress={() => setShowEditProfile(true)}
              Icon={Edit2Icon}
              iconColor="#FFF"
              iconSize={28}
              style={{ backgroundColor: '#007AFF' }}
              textStyle={{ color: '#FFF' }}
            />
            <AppButton
              title="Change Password"
              onPress={() => setShowChangePassword(true)}
              Icon={EditIcon}
              iconColor="#FFF"
              iconSize={28}
              style={{ backgroundColor: '#007AFF' }}
              textStyle={{ color: '#FFF' }}
            />
            <AppButton
              title={`Switch to ${role === 'customer' ? 'Rider' : 'Customer'}`}
              onPress={() => setSwitchRole(true)}
              iconColor="#FFF"
              iconSize={28}
              style={{ backgroundColor: '#007AFF' }}
              textStyle={{ color: '#FFF' }}
            />
            <AppButton
              title='Delete Profile'
              onPress={() => setShowDeleteProfile(true)}
              style={{ backgroundColor: '#FF3B30' }}
            />
            <AppButton
              title="Logout"
              onPress={handleLogout}
              Icon={LogOut}
              iconColor="#FF3B30"
              iconSize={28}
              style={{ backgroundColor: '#fff' }}
              textStyle={{ color: '#FF3B30' }}
            />
          </ScrollView>

        )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 30,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
});




