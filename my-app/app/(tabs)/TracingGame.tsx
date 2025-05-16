import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

const router = useRouter();
const stages = ['Trace the figure 8', 'Completely fill the circle', 'Accurately trace the lines'];

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
  const { name, ssn, highLevel, score, averageTime } = useLocalSearchParams();
  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';
  const playerScore = typeof score === 'string' || typeof score === 'number' ? score : '';
  const playerAverageTime = typeof averageTime === 'string' || typeof averageTime === 'number' ? averageTime : '';

  const [stageIndex, setStageIndex] = useState(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [uncovered, setUncovered] = useState(1000);
  const [extraInk, setExtraInk] = useState(0);
  const [tracingScore, setTracingScore] = useState(1000);
  const stageScores = useRef<number[]>([]);

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        calculateScore();
        if (prev <= 0.1) {
        //  handleContinue();
          return 60;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stageIndex, points]);

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
    const validScores = stageScores.current.slice(0, stageIndex + 1);
    const averageScore = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    setTracingScore(averageScore);
  };

  const saveTracingToHistory = async () => {
    try {
      const existingHistoryString = await AsyncStorage.getItem('gameHistory');
      const existingHistory = existingHistoryString ? JSON.parse(existingHistoryString) : [];

      const newEntry = {
        name: playerName,
        ssn: playerSSN,
        highLevel: playerHighLevel,
        reactionTimeScore: playerScore,
        averageTime: playerAverageTime,
        tracingScore,
        date: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...existingHistory];
      await AsyncStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('[ERROR] Failed to save tracing game history:', err);
    }
  };

  const handleContinue = async () => {
    
if (stageIndex < stages.length - 1) {
  console.log(`DEBUG: Finished Stage ${stageIndex + 1} with Score: ${stageScores.current[stageIndex]}`);
} else {
  console.log(`DEBUG: Finished Final Stage with Score: ${stageScores.current[stageIndex]}`);
}

    if (stageIndex < stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setPoints([]);
      setPaths([]);
      setTimeLeft(60);
      setUncovered(1000);
      setExtraInk(0);
      console.log('DEBUG: TRACE AVT is', playerAverageTime);
    } else {
      await saveTracingToHistory();
      router.push({
        pathname: '/GameHistory',
        params: {
          name: playerName,
          ssn: playerSSN,
          highLevel: playerHighLevel,
          score: playerScore,
          averageTime: playerAverageTime,
          tracingScore,
        },
      });
    }
    
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX: x, locationY: y } = event.nativeEvent;
        if (!isFinite(x) || !isFinite(y)) return;
        setPaths((prev) => [...prev, `M${x},${y}`]);
        setPoints(prev => [...prev, { x, y }]);
      },
      onPanResponderMove: (event) => {
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
    })
  ).current;

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
});
