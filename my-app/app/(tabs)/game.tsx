import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Asset } from 'expo-asset';

export default function MemoryGame() {
  const { name, ssn, highLevel, age, reset } = useLocalSearchParams();
  const router = useRouter();

  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';
  const playerAge = typeof age === 'string' ? age : '';

  const [responseTime, setResponseTime] = useState(null);
  const [numResponses, setNumResponses] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameState, setGameState] = useState('waiting');
  const [timerId, setTimerId] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const [brakeOn, setBrakeOn] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const brakeTimeout = useRef(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const triggerBrake = () => {
    setBrakeOn(false);
    const delay = 3000 + Math.random() * 2000;
    brakeTimeout.current = setTimeout(() => {
      setBrakeOn(true);
      setStartTime(Date.now());
    }, delay);
  };

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      await Asset.loadAsync(require('../../assets/Carrear.png'));
      setAssetsLoaded(true);
    }
    loadAssets();
  }, []);

  useEffect(() => {
    if (reset === 'true') {
      startGame();
      router.replace({
        pathname: '/game',
        params: { name: playerName, ssn: playerSSN, highLevel: playerHighLevel, age: playerAge, reset: undefined },
      });
    }
  }, [reset]);

  const startGame = () => {
    if (timerId) clearTimeout(timerId);
    if (intervalId) clearInterval(intervalId);
    if (brakeTimeout.current) clearTimeout(brakeTimeout.current);

    setGameState('playing');
    setNumResponses(0);
    setResponseTime(null);
    setReactionTimes([]);
    setBrakeOn(false);
    setStartTime(null);

    triggerBrake();
  };

  const handleScreenPress = () => {
    if (gameState !== 'playing' || !brakeOn || !startTime) return;
    const timeTaken = Date.now() - startTime;
    setResponseTime(timeTaken);
    setReactionTimes(prev => [...prev, timeTaken]);
    setNumResponses(prev => prev + 1);
    setBrakeOn(false);
    setStartTime(null);

    if (numResponses + 1 >= 10) {
      setGameState('finished');
      if (intervalId) clearInterval(intervalId);
      if (brakeTimeout.current) clearTimeout(brakeTimeout.current);
    } else {
      triggerBrake();
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      if (intervalId) clearInterval(intervalId);
      if (brakeTimeout.current) clearTimeout(brakeTimeout.current);

      const score = reactionTimes.length;
      const averageTime =
        score > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / score) : 0;
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

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (brakeTimeout.current) clearTimeout(brakeTimeout.current);
    };
  }, []);

  const carWidth = 300;
  const carHeight = 300;
  const brakeLightOffsetY = 160;
  const brakeLightOffsetX = 120;
  const brakeLightSpacing = 203;

  if (!assetsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 24 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleScreenPress}>
      {gameState === 'waiting' && (
        <TouchableOpacity onPress={startGame} style={styles.fullscreenButton}>
          <Text style={styles.tapToStart}>Tap anywhere to start</Text>
        </TouchableOpacity>
      )}

      {gameState === 'playing' && (
        <>
          <Text style={styles.instruction}>
            When the brake lights turn <Text style={{ color: 'red' }}>red</Text>, tap anywhere as fast as you can!
          </Text>

          <Image
            source={require('../../assets/Carrear.png')}
            style={{
              width: carWidth,
              height: carHeight,
              position: 'absolute',
              top: screenHeight * 0.12 + 50,
              left: '50%',
              marginLeft: -carWidth / 2,
              zIndex: 3,
            }}
            resizeMode="contain"
          />

          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 24,
              borderWidth: 4,
              borderColor: '#333',
              position: 'absolute',
              left: '50%',
              marginLeft: -brakeLightOffsetX,
              top: screenHeight * 0.12 + brakeLightOffsetY,
              backgroundColor: brakeOn ? 'red' : '#aaa',
              zIndex: 4,
            }}
          />
          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 24,
              borderWidth: 4,
              borderColor: '#333',
              position: 'absolute',
              left: '50%',
              marginLeft: brakeLightSpacing - brakeLightOffsetX,
              top: screenHeight * 0.12 + brakeLightOffsetY,
              backgroundColor: brakeOn ? 'red' : '#aaa',
              zIndex: 4,
            }}
          />

          <View style={[styles.road, {
            width: Math.min(screenWidth * 0.9, 500),
            height: Math.max(screenHeight * 0.18, 100),
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
            zIndex: 1,
          }]}>
            <View style={[styles.laneLineContainer, { left: '20%', transform: [{ translateX: -20 }] }]}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={`left-${i}`}
                  style={{
                    width: 16,
                    height: 64,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    marginVertical: 10,
                    opacity: 0.7,
                  }}
                />
              ))}
            </View>
            <View style={[styles.laneLineContainer, { left: '80%', transform: [{ translateX: 20 }] }]}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={`right-${i}`}
                  style={{
                    width: 16,
                    height: 64,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    marginVertical: 10,
                    opacity: 0.7,
                  }}
                />
              ))}
            </View>
          </View>

          <Text style={styles.responseTime}>
            {numResponses > 0 && reactionTimes.length > 0
              ? `Last Reaction: ${reactionTimes[reactionTimes.length - 1]} ms`
              : ''}
          </Text>
          <Text style={styles.responseTime}>
            {numResponses > 0
              ? `Average: ${Math.round(
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                )} ms`
              : ''}
          </Text>
          <Text style={styles.responseTime}>{`Brake Events: ${numResponses}/10`}</Text>
        </>
      )}

      {gameState === 'finished' && (
        <>
          <Text style={styles.finishedText}>Evaluation Over</Text>
          <Text style={styles.responseTime}>
            Average Reaction Time: {reactionTimes.length > 0
              ? `${Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)} ms`
              : 'N/A'}
          </Text>
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
          <TouchableOpacity onPress={() => router.push({ pathname: '/preGame' })}>
            <Text style={styles.historyLink}>End</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000036',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  road: {
    backgroundColor: '#444',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  laneLineContainer: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: [{ translateX: -8 }],
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  responseTime: {
    fontSize: 20,
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  finishedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
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
  instruction: {
    fontSize: 18,
    marginBottom: 400,
    textAlign: 'center',
    color: 'white',
    marginTop: 30,
  },
  historyLink: {
    fontSize: 18,
    color: 'skyblue',
    marginTop: 20,
    textAlign: 'center',
  },
});