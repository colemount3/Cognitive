import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, PanResponder, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const stages = ['Trace the figure 8', 'Completely fill the circle', 'Accurately trace the lines. '];

const eight = [
  'M175,235 A80,80 0 1,1 165,235.5 A80,80 0 1,1 175,235',
];
const circle = [
  'M275,235 A100,100 0 1,1 275,234.99 Z',
];
const lines = [
  'M50,200 H300',
  'M50,300 H300',
  'M50,400 H300',
  'M50,100 H300',
];

const stageShapes = [eight, circle, lines];

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function sampleShapePoints(stageIndex: number, numSamples: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  if (stageIndex === 0) {
    const cx1 = 175, cy1 = 320, rx1 = 80, ry1 = 80;
    const cx2 = 165, cy2 = 155.5, rx2 = 80, ry2 = 80;
    for (let i = 0; i < numSamples / 2; i++) {
      const theta = (2 * Math.PI * i) / (numSamples / 2);
      points.push({
        x: cx1 + rx1 * Math.cos(theta),
        y: cy1 + ry1 * Math.sin(theta),
      });
    }
    for (let i = 0; i < numSamples / 2; i++) {
      const theta = (2 * Math.PI * i) / (numSamples / 2);
      points.push({
        x: cx2 + rx2 * Math.cos(theta),
        y: cy2 + ry2 * Math.sin(theta),
      });
    }
  } else if (stageIndex === 1) {
    const cx = 175, cy = 235, r = 105;
    const steps = Math.sqrt(numSamples);
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const xNorm = (i / (steps - 1)) * 2 - 1;
        const yNorm = (j / (steps - 1)) * 2 - 1;
        if (xNorm * xNorm + yNorm * yNorm <= 1) {
          points.push({
            x: cx + r * xNorm,
            y: cy + r * yNorm,
          });
        }
      }
    }
    const circumferenceSamples = Math.floor(numSamples / 2);
    for (let i = 0; i < circumferenceSamples; i++) {
      const theta = (2 * Math.PI * i) / circumferenceSamples;
      points.push({
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta),
      });
    }
  } else if (stageIndex === 2) {
    const lines = [
      { y: 200 }, { y: 300 }, { y: 400 }, { y: 100 }
    ];
    lines.forEach(line => {
      for (let i = 0; i < numSamples / 4; i++) {
        const x = 50 + ((300 - 50) * i) / (numSamples / 4 - 1);
        points.push({ x, y: line.y });
      }
    });
  }
  return points;
}

const TracingGame = () => {
  const hasSavedRef = useRef(false);
  const router = useRouter();
  const { name, ssn, highLevel, score, averageTime, age } = useLocalSearchParams();
  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';
  const playerScore = typeof score === 'string' || typeof score === 'number' ? score : '';
  const playerAverageTime = typeof averageTime === 'string' || typeof averageTime === 'number' ? averageTime : '';
  const playerAge = typeof age === 'string' ? age : '';

  const [stageIndex, setStageIndex] = useState(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [uncovered, setUncovered] = useState(1000);
  const [extraInk, setExtraInk] = useState(0);
  const [tracingScore, setTracingScore] = useState(1000);
  const [continueDisabled, setContinueDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const stageScores = useRef<number[]>([0, 0, 0]);
  const lastUpdate = useRef(Date.now());

  useFocusEffect(
    React.useCallback(() => {
      setStageIndex(0);
      setPoints([]);
      setPaths([]);
      setTimeLeft(30);
      setUncovered(1000);
      setExtraInk(0);
      setTracingScore(1000);
      stageScores.current = [0, 0, 0];
      setContinueDisabled(false);
      hasSavedRef.current = false;
    }, [])
  );

  useEffect(() => {
    if (timeLeft <= 0) return; // Don't start interval if timer is 0

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        calculateScore();
        if (prev <= 0.1) {
          clearInterval(interval); // Stop interval when timer hits 0
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stageIndex, timeLeft]);

  const calculateScore = () => {
    const numSamples = 400;
    const threshold = 12;
    const pathPoints = sampleShapePoints(stageIndex, numSamples);

    let missed = 0;
    pathPoints.forEach((shapePoint) => {
      const isCovered = points.some(userPoint => distance(userPoint, shapePoint) < threshold);
      if (!isCovered) missed++;
    });
    let uncoveredScore = Math.round(1000 * (missed / pathPoints.length));
    setUncovered(uncoveredScore);

    let outsideInk = 0;
    points.forEach((userPoint) => {
      const isInside = pathPoints.some(shapePoint => distance(userPoint, shapePoint) < threshold);
      if (!isInside) outsideInk++;
    });
    setExtraInk(outsideInk);

    const finalScore = Math.max(1000 - (uncoveredScore + outsideInk), 0);
    stageScores.current[stageIndex] = finalScore;

    // Calculate average completed stages
    const validScores = stageScores.current.slice(0, stageIndex + 1).filter(s => typeof s === 'number');
    const averageScore = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    setTracingScore(averageScore);
  };

  const saveTracingToHistory = async (finalTracingScore: number) => {
    try {
      const existingHistoryString = await AsyncStorage.getItem('gameHistory');
      const existingHistory = existingHistoryString ? JSON.parse(existingHistoryString) : [];

      const newEntry = {
        name: playerName,
        ssn: playerSSN,
        highLevel: playerHighLevel,
        score: playerScore,
        averageTime: playerAverageTime,
        tracingScore: finalTracingScore,
        age: playerAge,
        date: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...existingHistory];
      await AsyncStorage.setItem('gameHistory', JSON.stringify(updatedHistory));

      console.log('[DEBUG] Sending to Google Sheet:', JSON.stringify(newEntry));

      const response = await fetch('https://script.google.com/macros/s/AKfycbw62sTC7dL9y0ZKxyCVyPIelYK1whOwxQMhEfNmCz43q9DlhM7TrE2TxC16hCbL2aAM0A/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
        mode: 'no-cors',
      });

      const responseText = await response.text();
      console.log('[DEBUG] Response from Google Script:', responseText);

      if (!response.ok) {
        console.error('[ERROR] Google Script HTTP error:', response.status);
      }

    } catch (err) {
      console.error('[ERROR] Failed to save tracing game history or send to Google Sheet:', err);
    }
  };

  const handleContinue = async () => {
    if (continueDisabled) return; // Prevent double call
    setContinueDisabled(true);

    //  calculate and store the score for the current stage 
    const numSamples = 400;
    const threshold = 12;
    const pathPoints = sampleShapePoints(stageIndex, numSamples);

    let missed = 0;
    pathPoints.forEach((shapePoint) => {
      const isCovered = points.some(userPoint => distance(userPoint, shapePoint) < threshold);
      if (!isCovered) missed++;
    });
    let uncoveredScore = Math.round(1000 * (missed / pathPoints.length));

    let outsideInk = 0;
    points.forEach((userPoint) => {
      const isInside = pathPoints.some(shapePoint => distance(userPoint, shapePoint) < threshold);
      if (!isInside) outsideInk++;
    });

    const finalScore = Math.max(1000 - (uncoveredScore + outsideInk), 0);
    stageScores.current[stageIndex] = finalScore;

    if (stageIndex < stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setPoints([]);
      setPaths([]);
      setTimeLeft(30);
      setUncovered(1000);
      setExtraInk(0);
      setContinueDisabled(false);
    } else {
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        setLoading(true); //  loading

        //  average tracing score from all three stages
        const allScores = stageScores.current.slice(0, 3).filter(s => typeof s === 'number');
        const finalTracingScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
        await saveTracingToHistory(finalTracingScore);

        setLoading(false); // Hide loading indicator 
        router.push({
          pathname: '/GameHistory',
          params: {
            name: playerName,
            ssn: playerSSN,
            highLevel: playerHighLevel,
            score: playerScore,
            averageTime: playerAverageTime,
            tracingScore: finalTracingScore,
          },
        });

        // --- Reset TracingGame state for next player ---
        setStageIndex(0);
        setPoints([]);
        setPaths([]);
        setTimeLeft(30);
        setUncovered(1000);
        setExtraInk(0);
        setTracingScore(1000);
        stageScores.current = [0, 0, 0];
        setContinueDisabled(false);
        hasSavedRef.current = false;
      }
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => timeLeft > 0,
    onPanResponderGrant: (event) => {
      if (timeLeft <= 0) return;
      const { locationX: x, locationY: y } = event.nativeEvent;
      if (!isFinite(x) || !isFinite(y)) return;
      setPaths((prev) => [...prev, `M${x},${y}`]);
      setPoints(prev => [...prev, { x, y }]);
    },
    onPanResponderMove: (event) => {
      if (timeLeft <= 0) return;
      const now = Date.now();
      if (now - lastUpdate.current < 16) return;
      lastUpdate.current = now;

      const { locationX: x, locationY: y } = event.nativeEvent;
      if (!isFinite(x) || !isFinite(y)) return;

      setPaths((prev) => {
        const updated = [...prev];
        const currentPathIndex = updated.length - 1;
        updated[currentPathIndex] += ` L${x},${y}`;
        return updated;
      });

      setPoints((prev) => [...prev, { x, y }]);
    },
    onPanResponderRelease: () => {},
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracing Game</Text>
      <Text style={styles.subtitle}>{stages[stageIndex]}</Text>
      <Text style={styles.timer}>Time left: {timeLeft.toFixed(1)}s</Text>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg
          width={Dimensions.get('window').width - 40}
          height={Dimensions.get('window').height / 2}
        >
          {stageShapes[stageIndex].map((shape, index) => (
            <Path
              key={`shape-${index}`}
              d={shape}
              stroke="#000"
              strokeWidth={16}
              fill={stageIndex === 1 ? '#000' : 'none'}
              opacity={0.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {paths.map((path, index) => (
            <Path
              key={`path-${index}`}
              d={path}
              stroke="blue"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>

      <Button title="Continue" onPress={handleContinue} />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#900" />
          <Text style={{ marginTop: 16, fontSize: 18 }}>Saving results...</Text>
        </View>
      )}
    </View>
  );
};

export default TracingGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
    color: '#555',
  },
  timer: {
    fontSize: 16,
    marginBottom: 10,
    color: '#900',
  },
  score: {
    fontSize: 16,
    marginBottom: 10,
    color: '#090',
  },
  canvasContainer: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height / 2,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});