import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user token or session
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://10.15.56.133:5000'; // Replace with your backend URL
const socket = io(SOCKET_URL);

const VoiceCall = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'ongoing'>('idle');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch current logged-in user ID
    const fetchCurrentUser = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'You are not logged in.');
          return;
        }

        const response = await fetch(`${SOCKET_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch current user');
        }

        const userData = await response.json();
        setCurrentUserId(userData._id);
        socket.emit('joinRoom', userData._id);
        console.log(`User joined room: ${userData._id}`);
      } catch (error) {
        console.error('Error fetching current user:', error);
        Alert.alert('Error', 'Failed to fetch your account details. Please try again.');
      }
    };

    fetchCurrentUser();

    // Fetch the list of users
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/calls/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Listen for incoming calls
    socket.on('incomingCall', ({ callerId }) => {
      console.log(`Incoming call from ${callerId}`);
      setCallerId(callerId);
      setCallStatus('ringing');
      Alert.alert(
        'Incoming Call',
        `You have an incoming call from ${callerId}`,
        [
          { text: 'Reject', onPress: () => handleRejectCall(callerId), style: 'cancel' },
          { text: 'Accept', onPress: () => handleAcceptCall(callerId) },
        ],
        { cancelable: false }
      );
    });

    // Handle call accepted
    socket.on('callAccepted', ({ receiverId }) => {
      console.log(`Call accepted by ${receiverId}`);
      setCallStatus('ongoing');
      Alert.alert('Call in Progress', `You are now on a call with ${receiverId}`);
    });

    // Handle call ended
    socket.on('callEnded', ({ callerId, receiverId }) => {
      console.log(`Call ended between ${callerId} and ${receiverId}`);
      setCallStatus('idle');
      setCallerId(null);
    });

    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, []);

  const handleCallUser = (receiverId: string) => {
    console.log(`Calling user: ${receiverId}`);
    if (!currentUserId) {
      Alert.alert('Error', 'Your user ID is not set.');
      return;
    }
    socket.emit('callUser', { callerId: currentUserId, receiverId });
    Alert.alert('Calling', `Calling user ${receiverId}...`);
  };

  const handleAcceptCall = (callerId: string) => {
    console.log(`Accepting call from: ${callerId}`);
    if (!currentUserId) {
      Alert.alert('Error', 'Your user ID is not set.');
      return;
    }
    socket.emit('acceptCall', { callerId, receiverId: currentUserId });
    setCallStatus('ongoing');
  };

  const handleRejectCall = (callerId: string) => {
    console.log(`Rejecting call from: ${callerId}`);
    if (!currentUserId) {
      Alert.alert('Error', 'Your user ID is not set.');
      return;
    }
    socket.emit('rejectCall', { callerId, receiverId: currentUserId });
    setCallStatus('idle');
    setCallerId(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Users</Text>
      <FlatList
        data={users.filter((user) => user._id !== currentUserId)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.name}</Text>
            <Button title="Call" onPress={() => handleCallUser(item._id)} />
          </View>
        )}
      />
      {callStatus === 'ongoing' && (
        <View style={styles.callStatusContainer}>
          <Text style={styles.callStatusText}>Call in progress...</Text>
          <Button
            title="End Call"
            onPress={() => {
              if (callerId) {
                socket.emit('endCall', { callerId: currentUserId, receiverId: callerId });
              }
              setCallStatus('idle');
            }}
            color="red"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  userCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 15, backgroundColor: '#FFFFFF', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  callStatusContainer: { marginTop: 20, alignItems: 'center' },
  callStatusText: { fontSize: 18, marginBottom: 10, color: '#007BFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
});

export default VoiceCall;
