import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CampaignPage = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!selectedCampaign || !amount) {
      Alert.alert('Error', 'Please select a campaign and enter an amount.');
      return;
    }

    Alert.alert('Success', `You have donated ${amount} to ${selectedCampaign}!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support a Campaign</Text>

      {/* Dropdown for Campaign Selection */}
      <Text style={styles.label}>Select Campaign:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCampaign}
          onValueChange={(itemValue) => setSelectedCampaign(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a campaign" value="" />
          <Picker.Item label="Ek Takar Ahar" value="Ek Takar Ahar" />
          <Picker.Item label="As Sunnah" value="As Sunnah" />
          <Picker.Item label="Brac" value="Brac" />
        </Picker>
      </View>

      {/* Amount Input */}
      <Text style={styles.label}>Enter Amount:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={(text) => setAmount(text)}
      />

      {/* Payment Options */}
      <Text style={styles.label}>Payment Options:</Text>
      <View style={styles.paymentContainer}>
        <TouchableOpacity style={styles.paymentOption}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/BKash-bKash-Logo.wine.png' }}
            style={styles.icon}
          />
          <Text style={styles.paymentText}>bKash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          <Image
            source={{ uri: 'https://nagad.com.bd/images/logo/nagad-logo-en.svg' }}
            style={styles.icon}
          />
          <Text style={styles.paymentText}>Nagad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Credit_card_font_awesome.svg' }}
            style={styles.icon}
          />
          <Text style={styles.paymentText}>Credit Card</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CampaignPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2e7d32',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  paymentOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
