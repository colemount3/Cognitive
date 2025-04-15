import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Memory Game Component
export default function MemoryGame() {
  const [dotPosition, setDotPosition] = useState({ top: 0, left: 0 });
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);
  const [numResponses, setNumResponses] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Function to generate random positions
  const getRandomPosition = () => {
    const screenWidth = 400; // Adjust these values based on your screen size
    const screenHeight = 800; // Adjust these values based on your screen size
    return {
      top: Math.random() * (screenHeight - 50), // 50 is the size of the dot/button
      left: Math.random() * (screenWidth - 50), // 50 is the size of the dot/button
    };
  };

  // Start new round
  const startRound = () => {
    const newDotPosition = getRandomPosition();
    const newButtonPosition = getRandomPosition();
    setDotPosition(newDotPosition);
    setButtonPosition(newButtonPosition);
    setStartTime(Date.now()); // Start timer when the dot appears
  };

  // Handle button press (response)
  const handleButtonPress = () => {
    if (startTime) {
      const timeTaken = Date.now() - startTime;
      setResponseTime(timeTaken);
      setNumResponses(prev => prev + 1);
      setAverageResponseTime(prev =>
        (prev * (numResponses) + timeTaken) / (numResponses + 1)
      );
    }
    startRound(); // Start a new round
  };

  // Start first round on component mount
  useEffect(() => {
    startRound();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <Text style={styles.instruction}>Press the red button as quickly as possible!</Text>
      <Text style={styles.responseTime}>
        {responseTime ? `Response Time: ${(responseTime / 1000).toFixed(2)}s` : 'Press the button!'}
      </Text>
      <Text style={styles.averageResponseTime}>
        {numResponses > 0
          ? `Average Response Time: ${(averageResponseTime / 1000).toFixed(2)}s`
          : ''}
      </Text>

      <View
        style={[
          styles.dot,
          {
            position: 'absolute',
            top: dotPosition.top,
            left: dotPosition.left,
            backgroundColor: 'blue',
          },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.button,
          {
            position: 'absolute',
            top: buttonPosition.top,
            left: buttonPosition.left,
            backgroundColor: 'red',
          },
        ]}
        onPress={handleButtonPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    marginBottom: 10,
  },
  responseTime: {
    fontSize: 20,
    marginBottom: 10,
  },
  averageResponseTime: {
    fontSize: 20,
    marginBottom: 20,
  },
  dot: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

