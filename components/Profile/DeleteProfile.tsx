import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AppButton from '../Button';

interface Props {
    title: string;
    onDelete: () => void;
    onCancel:()=>void;
}

const DeleteProfile = ({ title, onDelete,onCancel }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <AppButton style={{backgroundColor:'#FF3B30'}} title="Delete Profile" onPress={onDelete} />
            <AppButton title="Back to Profile" onPress={onCancel} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default DeleteProfile;
