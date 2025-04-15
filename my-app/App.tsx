import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const App = () => {
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [responseTime, setResponseTime] = useState<number | null>(null); // Time for each press
  const [responseTimes, setResponseTimes] = useState<number[]>([]); // All recorded response times
  const [gameTime, setGameTime] = useState(120); // 2 minutes
  const [gameOver, setGameOver] = useState(false); // Check if game is over

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameTime > 0) {
        setGameTime((prev) => prev - 1); // Reduce game time by 1 second
      } else {
        clearInterval(timer);
        setGameOver(true);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [gameTime]);

  // Function to generate random positions
  const generateRandomPosition = () => {
    return {
      x: Math.random() * (width - 100), // Random X within screen width
      y: Math.random() * (height - 100), // Random Y within screen height
    };
  };

  // Function that triggers when the button is pressed
  const handlePress = () => {
    const newDotPosition = generateRandomPosition();
    const newButtonPosition = generateRandomPosition();
    
    const startTime = Date.now();
    setDotPosition(newDotPosition);
    setButtonPosition(newButtonPosition);

    // Track the response time
    const elapsedTime = Date.now() - startTime;
    setResponseTimes((prev) => [...prev, elapsedTime]);

    // Reset response time
    setResponseTime(elapsedTime);
  };

  // Calculate average response time
  const averageResponseTime = () => {
    const total = responseTimes.reduce((acc, time) => acc + time, 0);
    return total / responseTimes.length;
  };

  return (
    <View style={styles.container}>
      {!gameOver ? (
        <>
          <Text style={styles.timer}>{`Time Remaining: ${gameTime}s`}</Text>
          <View
            style={[
              styles.dot,
              { left: dotPosition.x, top: dotPosition.y },
            ]}
          ></View>
          <TouchableOpacity
            style={[
              styles.button,
              { left: buttonPosition.x, top: buttonPosition.y },
            ]}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>Press Me!</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.resultText}>
          Game Over! Average Response Time: {averageResponseTime().toFixed(2)} ms
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    position: 'absolute',
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  timer: {
    fontSize: 20,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;

