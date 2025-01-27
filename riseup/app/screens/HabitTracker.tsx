import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, BarChart } from 'react-native-chart-kit';
import axios from 'axios';

interface HabitEntry {
  date: string;
  mood: {
    feeling: string;
    energyLevel: string;
  };
}

const screenWidth = Dimensions.get('window').width;

const HabitTracker = () => {
  const [mood, setMood] = useState('Happy');
  const [energy, setEnergy] = useState('High');
  const [questions, setQuestions] = useState([
    { question: 'How often do you engage in this habit?', answer: '' },
    { question: 'Do you feel in control of this habit?', answer: '' },
  ]);
  const [data, setData] = useState<HabitEntry[]>([]);

  // Replace with your actual user ID
  const userId = '63e1f6e7f9a3c4b1f4d1c2a3'; // Example valid user ID

  // Save user responses
  const handleSave = async () => {
    try {
      if (!questions.every((q) => q.answer)) {
        Alert.alert('Error', 'Please answer all questions before saving.');
        return;
      }

      const payload = {
        userId,
        questions,
        mood: { feeling: mood, energyLevel: energy },
      };

      console.log('Saving payload:', payload); // Debug payload
      const response = await axios.post(
        'http://10.10.200.209:5000/habitTracker/create',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Save Response:', response.data); // Debug response
      Alert.alert('Success', 'Your responses have been saved!');
      fetchData();
    } catch (error: any) {
      console.error('Save Error:', error.response?.data || error.message || error);
      Alert.alert(
        'Error',
        `Failed to save your responses. ${error.response?.data?.message || ''}`
      );
    }
  };

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://10.10.200.209:5000/habitTracker/user/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Fetched Data:', response.data); // Debug fetched data
      setData(response.data);
    } catch (error: any) {
      console.error('Fetch Data Error:', error.response?.data || error.message || error);
      Alert.alert(
        'Error',
        `Failed to fetch data. ${error.response?.data?.message || ''}`
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare graph data
  const graphData = {
    labels: data.map((entry) => {
      const date = new Date(entry.date);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        data: data.map((entry) => {
          if (entry.mood.energyLevel === 'High') return 3;
          if (entry.mood.energyLevel === 'Medium') return 2;
          if (entry.mood.energyLevel === 'Low') return 1;
          return 0; // Default value if none matches
        }),
        color: () => '#2e7d32',
      },
    ],
  };

  const hasValidData =
    graphData.labels.length > 0 && graphData.datasets[0].data.every((value) => typeof value === 'number');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Habit Tracker</Text>

      <View style={styles.questionsSection}>
        <Text style={styles.sectionTitle}>Answer the Questions</Text>
        {questions.map((item, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.question}>{item.question}</Text>
            <Picker
              selectedValue={item.answer}
              onValueChange={(value) => {
                const updatedQuestions = [...questions];
                updatedQuestions[index].answer = value;
                setQuestions(updatedQuestions);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="High" value="High" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Never" value="Never" />
            </Picker>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Mood:</Text>
      <Picker
        selectedValue={mood}
        onValueChange={(value) => setMood(value)}
        style={styles.picker}
      >
        <Picker.Item label="Very Happy" value="Very Happy" />
        <Picker.Item label="Happy" value="Happy" />
        <Picker.Item label="Neutral" value="Neutral" />
        <Picker.Item label="Sad" value="Sad" />
        <Picker.Item label="Very Sad" value="Very Sad" />
      </Picker>

      <Text style={styles.label}>Energy Level:</Text>
      <Picker
        selectedValue={energy}
        onValueChange={(value) => setEnergy(value)}
        style={styles.picker}
      >
        <Picker.Item label="High" value="High" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Low" value="Low" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      {hasValidData ? (
        <>
          <Text style={styles.chartTitle}>Mood & Energy Trends</Text>
          <LineChart
            data={graphData}
            width={screenWidth - 30}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f5f5f5',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />

          <BarChart
            data={{
              labels: graphData.labels,
              datasets: graphData.datasets,
            }}
            width={screenWidth - 30}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f5f5f5',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </>
      ) : (
        <Text style={styles.errorText}>
          No valid data available to display charts.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  picker: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  chart: {
    marginVertical: 20,
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default HabitTracker;
