import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { router } from 'expo-router';


export default function MemoryGame() {
  const { name, ssn, highLevel, reset } = useLocalSearchParams();
  const router = useRouter();

  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';

  const [dotPosition, setDotPosition] = useState({ top: 0, left: 0 });
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);
  const [numResponses, setNumResponses] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120);

  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<
    { name: string; ssn: string; score: number; averageTime: number }[]
  >([]);

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
      //console.log('[DEBUG] timeTaken:', timeTaken);////////////

      setNumResponses(prev => {
        const newNum = prev + 1;
        //console.log('[DEBUG] Previous numResponses:', prev);/////////////
        //console.log('[DEBUG] New numResponses:', newNum);
        setAverageResponseTime(currentAvg =>
          (currentAvg * prev + timeTaken) / newNum
          
        );
        return newNum;
      });
    }
    startRound();
  };

  const resetGame = () => {
    if (timerId) clearTimeout(timerId);
    if (intervalId) clearInterval(intervalId);
    setTimerId(null);
    setIntervalId(null);
    setGameState('playing');
    setNumResponses(0);
    setAverageResponseTime(0);
    setResponseTime(null);
    setStartTime(null);
    setTimeLeft(10); // Or whatever you want
  };
  
  

  const startGame = () => {
    resetGame();
    setGameState('playing');
    setTimeLeft(10);
    startRound();////////////////////////////////////////
  };
  
  

  const endGame = () => {
    setGameState('finished');
    if (timerId) clearTimeout(timerId);
    if (intervalId) clearInterval(intervalId);

    
  };
  const saveGameToHistory = async () => {
    try {
      const existingHistoryString = await AsyncStorage.getItem('gameHistory');
      const existingHistory = existingHistoryString ? JSON.parse(existingHistoryString) : [];
  
      const newEntry = {
        name: playerName,
        ssn: playerSSN,
        highLevel: playerHighLevel,
        score: numResponses,
        averageTime: averageResponseTime,
      };
  
      const updatedHistory = [...existingHistory, newEntry];
      await AsyncStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
  
      setHistory(updatedHistory); // update local state
  
      router.push({
        pathname: '/GameHistory',
        params: {
          numResponses: numResponses.toString(),
          averageResponseTime: averageResponseTime.toString(),
        },
      });
  
      //console.log('[DEBUG] Game history saved with AsyncStorage');
      const verify = await AsyncStorage.getItem('gameHistory');
//console.log('[DEBUG] Saved gameHistory contents:', verify);

    } catch (err) {
      console.error('[ERROR] Failed to save game history:', err);
    }
  };
  
  
  useEffect(() => {
    if (reset === 'true') {
      resetGame();
      // Push to same screen without the reset param so it doesn't keep triggering
      router.replace({
        pathname: '/game',
        params: { name: playerName, ssn: playerSSN, highLevel: playerHighLevel, reset: undefined },
        
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
  
      return () => clearInterval(interval); // Cleanup when game ends or component unmounts
    }
  }, [gameState]);
  
  useEffect(() => {
    if (gameState === 'finished') {
      //console.log('[DEBUG] Game state changed to finished');
      saveGameToHistory().then(() => {
        router.push('/TransferScreen'); // <--- NEW ROUTE
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
          <Text style={styles.title}>Memory Game</Text>
          <Text style={styles.instruction}>Press the red button as quickly as possible!</Text>
          <Text style={styles.responseTime}>
            {responseTime !== null
              ? `Response Time: ${(responseTime / 1000).toFixed(2)}s`
              : 'Press the button!'}
          </Text>
          <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
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
              pathname: '/GameHistory',
              params: {
                history: encodeURIComponent(JSON.stringify(history)),
                numResponses: numResponses.toString(),
                averageResponseTime: averageResponseTime.toString(),
              },
    })
  }
>
         <Text style={styles.historyLink}>Save Evaluation to History</Text>

         
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