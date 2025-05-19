import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MemoryGame() {
  const { name, ssn, highLevel, age, reset } = useLocalSearchParams();
  const router = useRouter();

  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';
  const playerAge = typeof age === 'string' ? age : '';

  const [dotPosition, setDotPosition] = useState({ top: 0, left: 0 });
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [numResponses, setNumResponses] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120);

  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  //const [history, setHistory] = useState<
  //  { name: string; ssn: string; score: number; averageTime: number }[]
  //>([]);

  const getRandomPosition = () => {
    const screenWidth = 350;
    const screenHeight = 750;
    return {
      top: Math.random() * (screenHeight - 50),
      left: Math.random() * (screenWidth - 50),
    };
  };

  const startRound = () => {
    const newDotPosition = getRandomPosition();
    const newButtonPosition = getRandomPosition();
    setDotPosition(newDotPosition);
    setButtonPosition(newButtonPosition);
    setStartTime(Date.now());
  };

  const handleButtonPress = () => {
    if (startTime) {
      const timeTaken = Date.now() - startTime;
      setResponseTime(timeTaken);

      setNumResponses(prev => prev + 1);
    }
    startRound();
  };

  const resetGame = () => {
    if (timerId) clearTimeout(timerId);
    if (intervalId) clearInterval(intervalId);
    setTimerId(null);
    setIntervalId(null);
    setGameState('playing');
    setNumResponses(1);
    setResponseTime(null);
    setStartTime(null);
    setTimeLeft(10); // Or whatever you want
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
    setTimeLeft(10);
    startRound();
  };

  const endGame = () => {
    setGameState('finished');
    if (timerId) clearTimeout(timerId);
    if (intervalId) clearInterval(intervalId);
  };


  useEffect(() => {
    if (reset === 'true') {
      resetGame();
      router.replace({
        pathname: '/game',
        params: { name: playerName, ssn: playerSSN, highLevel: playerHighLevel, age: playerAge, reset: undefined },
      });
    }
  }, [reset]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState]);

useEffect(() => {
  if (gameState === 'finished') {
    const score = numResponses;
    const averageTime = score > 0 ? (10 * 1000) / score : 0;

    router.push({
      pathname: '/TransferScreen',
      params: {
        name: playerName,
        ssn: playerSSN,
        highLevel: playerHighLevel,
        score: score.toString(),
        averageTime: averageTime.toString(),
        age: playerAge,
      },
    });
  }
}, [gameState]);


  return (
    <View style={styles.container}>
      {gameState === 'waiting' && (
        <TouchableOpacity onPress={startGame} style={styles.fullscreenButton}>
          <Text style={styles.tapToStart}>Tap anywhere to start</Text>
        </TouchableOpacity>
      )}

      {gameState === 'playing' && (
        <>
          <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
          <Text style={styles.instruction}>Press the red button as quickly as possible!</Text>
          




         

          <View
            style={[
              styles.dot,
              {
                position: 'absolute',
                top: dotPosition.top + 50,
                left: dotPosition.left + 200,
                backgroundColor: 'blue',
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                position: 'absolute',
                top: buttonPosition.top + 50,
                left: buttonPosition.left + 50,
                backgroundColor: 'red',
              },
            ]}
            onPress={handleButtonPress}
          />
        </>
      )}

      {gameState === 'finished' && (
        <>
          <Text style={styles.finishedText}>Evaluation Over</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/TracingGame',
                params: {
                  name: playerName,
                  ssn: playerSSN,
                  highLevel: playerHighLevel,
                },
              })
            }
          >
            <Text style={styles.historyLink}>Continue to Tracing Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/preGame',
              });
            }}
          >
            <Text style={styles.historyLink}>End</Text>
          </TouchableOpacity>
        </>
      )}
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
  finishedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
  },
  fullscreenButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    width: '100%',
    height: '100%',
  },
  tapToStart: {
    fontSize: 24,
    color: '#000',
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyLink: {
    fontSize: 18,
    color: 'blue',
    marginTop: 20,
  },
});
