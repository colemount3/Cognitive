import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Image, Animated, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const GAME_DURATION = 60; // seconds
const START_SCORE = 100;
const CAR_WIDTH = 200;
const CAR_HEIGHT = 300;
const LANE_WIDTH = 20;
const LANE_GAP = 220;
const DASH_HEIGHT = 40;
const DASH_GAP = 30;
const DASH_COLOR = '#fff';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FireLaneGame({ route }) {
  // Get params sent from previous screen
  const { name, ssn, score: prevScore, age, reset } = useLocalSearchParams();

  // Use params from router or route (for compatibility)
  const playerName = name ?? (route?.params?.name ?? '');
  const playerSSN = ssn ?? (route?.params?.ssn ?? '');
  const playerAge = age ?? (route?.params?.age ?? '');
  const previousScore = prevScore ?? (route?.params?.score ?? '');

  const [laneCenterX, setLaneCenterX] = useState(SCREEN_WIDTH / 2);
  const [laneDirection, setLaneDirection] = useState(1);
  const [carX, setCarX] = useState((SCREEN_WIDTH - CAR_WIDTH) / 2);
  const [score, setScore] = useState(START_SCORE);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);

  const [targetX, setTargetX] = useState(SCREEN_WIDTH / 2);

  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

  const patternIndexRef = useRef(0);

  const carY = SCREEN_HEIGHT * 0.3;

  const dashAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  const getCurrentSpeed = () => {
    const progress = 1 - timeLeft / GAME_DURATION;
    return 2 + (7 - 2) * progress;
  };

  const lanePatternTargets = [
    SCREEN_WIDTH - LANE_GAP / 2,
    SCREEN_WIDTH / 2 + (SCREEN_WIDTH - LANE_GAP) * 0.25,
    LANE_GAP / 2,
    SCREEN_WIDTH - LANE_GAP / 2,
    SCREEN_WIDTH / 2 - (SCREEN_WIDTH - LANE_GAP) * 0.16,
    SCREEN_WIDTH - LANE_GAP / 2,
    LANE_GAP / 2,
    SCREEN_WIDTH / 2 + (SCREEN_WIDTH - LANE_GAP) * 0.16,
    LANE_GAP / 2,
  ];

  const pickNewTarget = () => {
    const end = lanePatternTargets[patternIndexRef.current % lanePatternTargets.length];
    patternIndexRef.current++;
    return end;
  };

  useEffect(() => {
    setLaneCenterX(SCREEN_WIDTH / 2);
    patternIndexRef.current = 0;
    setTargetX(() => lanePatternTargets[0]);
    setLaneDirection(1);
  }, [showCountdown]);

  const BUFFER = 90;

  useEffect(() => {
    if (showCountdown) return;
    const leftLaneX = laneCenterX - LANE_GAP / 2;
    const rightLaneX = laneCenterX + LANE_GAP / 2;
    if (
      carX < leftLaneX + LANE_WIDTH - BUFFER ||
      carX + CAR_WIDTH > rightLaneX + BUFFER
    ) {
      setScore(s => (s > 0 ? s - 0.25 : 0));
    }
  }, [carX, laneCenterX, showCountdown]);

  useEffect(() => {
    if (!showCountdown) return;
    setCountdown(3);
    setLaneCenterX(SCREEN_WIDTH / 2);
    patternIndexRef.current = 0;
    setTargetX(() => lanePatternTargets[0]);
    setLaneDirection(1);

    let timer;
    timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setShowCountdown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  useEffect(() => {
    if (gameOver || showCountdown) return;
    let interval = setInterval(() => {
      const speed = getCurrentSpeed();
      setLaneCenterX(prev => {
        let next = prev + laneDirection * speed;
        if (
          (laneDirection === 1 && next >= targetX) ||
          (laneDirection === -1 && next <= targetX)
        ) {
          setLaneDirection(d => -d);
          setTargetX(pickNewTarget());
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [gameOver, laneDirection, targetX, timeLeft, showCountdown]);

  useEffect(() => {
    if (gameOver || showCountdown) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, showCountdown]);

  useEffect(() => {
    if (gameOver || showCountdown) return;
    dashAnim.setValue(0);
    Animated.loop(
      Animated.timing(dashAnim, {
        toValue: DASH_HEIGHT + DASH_GAP,
        duration: 150,
        useNativeDriver: false,
      })
    ).start();
  }, [gameOver, showCountdown]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newX = Math.min(
          Math.max(gestureState.moveX - CAR_WIDTH / 2, 0),
          SCREEN_WIDTH - CAR_WIDTH
        );
        setCarX(newX);
      },
    })
  ).current;

  const leftLaneX = laneCenterX - LANE_GAP / 2;
  const rightLaneX = laneCenterX + LANE_GAP / 2;

  const dashedLanes = useMemo(() => {
    const renderDashedLane = (left) => {
      const dashCount = Math.ceil(SCREEN_HEIGHT * 0.8 / (DASH_HEIGHT + DASH_GAP)) + 2;
      const dashes = [];
      for (let i = 0; i < dashCount; i++) {
        dashes.push(
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: left,
              width: LANE_WIDTH,
              height: DASH_HEIGHT,
              backgroundColor: DASH_COLOR,
              borderRadius: 6,
              opacity: 1,
              top: dashAnim.interpolate({
                inputRange: [0, DASH_HEIGHT + DASH_GAP],
                outputRange: [
                  i * (DASH_HEIGHT + DASH_GAP),
                  i * (DASH_HEIGHT + DASH_GAP) + (DASH_HEIGHT + DASH_GAP),
                ],
              }),
            }}
          />
        );
      }
      return dashes;
    };
    return (
      <>
        {renderDashedLane(leftLaneX)}
        {renderDashedLane(rightLaneX)}
      </>
    );
  }, [leftLaneX, rightLaneX, dashAnim]);

  // Handler for navigating to GameHistory with all required params
  const goToHistory = () => {
    router.push({
      pathname: '/GameHistory',
      params: {
        name: playerName,
        ssn: playerSSN,
        tracingScore: Math.round(score * 10) / 10,
        score: previousScore,
        age: playerAge,
        date: new Date().toISOString(),
      },
    });

    // Reset all elements after navigating
    setTimeout(() => {
      setLaneCenterX(SCREEN_WIDTH / 2);
      setLaneDirection(1);
      setCarX((SCREEN_WIDTH - CAR_WIDTH) / 2);
      setScore(START_SCORE);
      setTimeLeft(GAME_DURATION);
      setGameOver(false);
      setTargetX(SCREEN_WIDTH / 2);
      setCountdown(3);
      setShowCountdown(true);
      patternIndexRef.current = 0;
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 KEEP CONTROL 🔥</Text>
      <Text style={styles.score}>Score: {Math.round(score * 10) / 10}</Text>
      <Text style={styles.timer}>Time Left: {timeLeft}s</Text>
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {dashedLanes}
        <Image
          source={require('../../assets/CarTop.png')}
          style={{
            position: 'absolute',
            left: carX,
            top: carY,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            zIndex: 2,
            pointerEvents: 'none',
          }}
          resizeMode="contain"
        />
        {/* Countdown Overlay */}
        {showCountdown && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>
              {countdown > 0 ? countdown : 'GO!'}
            </Text>
          </View>
        )}
        {/* Evaluation Over Overlay */}
        {gameOver && (
          <View style={styles.evaluationOverlay}>
            <Text style={styles.evaluationText}>Evaluation Over</Text>
            <Text style={styles.evaluationScore}>
              Your Score: {Math.round(score * 10) / 10}
            </Text>
            <TouchableOpacity style={styles.historyButton} onPress={goToHistory}>
              <Text style={styles.historyButtonText}>Go to Game History?</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 5,
  },
  timer: {
    fontSize: 18,
    color: '#ff0',
    marginBottom: 10,
  },
  gameArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#111',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  countdownText: {
    fontSize: 96,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#ff6600',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  evaluationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  evaluationText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  evaluationScore: {
    fontSize: 32,
    color: '#ff0',
    marginBottom: 40,
  },
  historyButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});