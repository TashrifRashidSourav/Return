import React, { useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  Button,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const App = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchResponse = async () => {
    if (!input.trim()) {
      alert('Please enter input.');
      return;
    }

    setLoading(true);
    setResponse(''); // Clear previous response

    try {
      const res = await axios.post('http://192.168.0.106:5000/airesponse', { input }); // Adjust for your backend IP
      setResponse(res.data.output); // Set the new response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      alert('Failed to fetch response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>AI Chat Assistant</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Button title="Get Response" onPress={fetchResponse} disabled={loading} />
        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>AI Response:</Text>
            <Text style={styles.response}>{response}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  loader: {
    marginTop: 20,
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default App;
