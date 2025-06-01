import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type Props = {
    fullname: string;
    email: string;
};

const ProfileHeader = ({ fullname, email }: Props) => {
    return (
        <View style={styles.header}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
                style={styles.avatar}
            />
            <Text style={styles.name}>{fullname || 'Loading...'}</Text>
            <Text style={styles.email}>{email || 'Loading...'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: 'white',
        marginBottom: 20,
        borderRadius: 12,
        elevation: 4,
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
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
});

export default ProfileHeader;
