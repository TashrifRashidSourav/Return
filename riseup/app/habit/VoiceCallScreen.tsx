import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { io } from 'socket.io-client';

interface User {
  _id: string;
  name: string;
  email: string;
}

const SERVER_URL = 'http://10.10.200.209:5000';
const SOCKET_URL = 'http://10.10.200.209:5000';

const VoiceCall: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<string>('user1'); // Replace with logged-in user's ID
  const [callInProgress, setCallInProgress] = useState(false);
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const socket = io(SOCKET_URL);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/calls/users`);
        const data = await response.json();
        setUsers(data.filter((user: User) => user._id !== loggedInUserId)); // Exclude self
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();

    // Connect to the Socket.IO server
    socket.emit('joinRoom', loggedInUserId);

    // Handle incoming call
    socket.on('incomingCall', ({ callerId }) => {
      setIncomingCall(callerId);
      console.log(`Incoming call from ${callerId}`);
    });

    // Handle call accepted
    socket.on('callAccepted', ({ receiverId }) => {
      setCallInProgress(true);
      Alert.alert('Call Accepted', `Connected to ${receiverId}`);
    });

    // Handle call ended
    socket.on('callEnded', ({ callerId, receiverId }) => {
      setCallInProgress(false);
      setIncomingCall(null);
      Alert.alert('Call Ended', `Call between ${callerId} and ${receiverId} ended`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const makeCall = (receiverId: string) => {
    socket.emit('callUser', { callerId: loggedInUserId, receiverId });
    setCallInProgress(true);
    Alert.alert('Calling', `Calling user ${receiverId}`);
  };

  const acceptCall = () => {
    if (incomingCall) {
      socket.emit('acceptCall', { callerId: incomingCall, receiverId: loggedInUserId });
      setCallInProgress(true);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('rejectCall', { callerId: incomingCall, receiverId: loggedInUserId });
      setIncomingCall(null);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => makeCall(item._id)}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {incomingCall && !callInProgress && (
        <View style={styles.callContainer}>
          <Text style={styles.callText}>Incoming call from {incomingCall}</Text>
          <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={rejectCall}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      {!callInProgress && (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
        />
      )}
      {callInProgress && (
        <View style={styles.callContainer}>
          <Text style={styles.callText}>Call in progress...</Text>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {
              setCallInProgress(false);
              socket.emit('endCall', { callerId: loggedInUserId });
            }}
          >
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f7f7' },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },
  callContainer: { alignItems: 'center', marginTop: 20 },
  callText: { fontSize: 20, marginBottom: 20 },
  acceptButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginBottom: 10 },
  rejectButton: { backgroundColor: 'red', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default VoiceCall;
