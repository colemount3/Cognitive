import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Alert, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const stages = ['Trace the figure 8', 'Completely fill the circle', 'Accurately trace the lines'];

const eight = [
  'M175,235 A80,80 0 1,1 165,235.5 A80,80 0 1,1 175,235', // Figure 8
];
const circle = [
  'M275,235 A100,100 0 1,1 275,234.99 Z', // Circle
];
const lines = [
  'M50,200 H300', // Line 1
  'M50,300 H300', // Line 2
  'M50,400 H300', // Line 3
  'M50,400 H300', // Line 4
];

const stageShapes = [eight, circle, lines];

const TracingGame = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<string[]>([]); // Store multiple paths
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState({ inShape: 0, outOfShape: 0 });

  const lastUpdate = useRef(Date.now()); // Ref to throttle updates

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          calculateScore();
          handleContinue();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stageIndex, points]);

  const handleContinue = () => {
    if (stageIndex < stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setPoints([]);
      setPaths([]);
      setTimeLeft(60);
      setScore({ inShape: 0, outOfShape: 0 });
    } else {
      Alert.alert('Game Complete', `Final Score: ${score.inShape}% in shape, ${score.outOfShape}% out of shape.`);
    }
  };

  const calculateScore = () => {
    const targetPath = stageShapes[stageIndex];
    let inShape = 0;
    let outOfShape = 0;

    points.forEach(({ x, y }) => {
      // Simple check: if the point is close to the target path (this is a placeholder for a more complex algorithm)
      const isInShape = Math.abs(x - 50) <= 50 && Math.abs(y - 50) <= 50; // Example bounding box check
      if (isInShape) {
        inShape++;
      } else {
        outOfShape++;
      }
    });

    const totalPoints = inShape + outOfShape;
    setScore({
      inShape: Math.round((inShape / totalPoints) * 100),
      outOfShape: Math.round((outOfShape / totalPoints) * 100),
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX: x, locationY: y } = event.nativeEvent;
        if (!isFinite(x) || !isFinite(y)) return;
        setPaths((prev) => [...prev, `M${x},${y}`]); // Start a new path
      },
      onPanResponderMove: (event) => {
        const now = Date.now();
        if (now - lastUpdate.current < 16) return; // Throttle updates to ~60fps
        lastUpdate.current = now;

        const { locationX: x, locationY: y } = event.nativeEvent;
        if (!isFinite(x) || !isFinite(y)) return;
        setPaths((prev) => {
          const updated = [...prev];
          const currentPathIndex = updated.length - 1;
          updated[currentPathIndex] += ` L${x},${y}`; // Append to the current path
          return updated;
        });
      },
      onPanResponderRelease: () => {
        calculateScore(); // Optionally calculate score after each path
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracing Game</Text>
      <Text style={styles.subtitle}>{stages[stageIndex]}</Text>
      <Text style={styles.timer}>Time left: {timeLeft}s</Text>
      <Text style={styles.score}>
        Score: {score.inShape}% in shape, {score.outOfShape}% out of shape
      </Text>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg
          width={Dimensions.get('window').width - 40}
          height={Dimensions.get('window').height / 2}
        >
          {stageShapes[stageIndex].map((shape, index) => (
            <Path
              key={`shape-${index}`}
              d={shape}
              stroke="#ccc"
              strokeWidth={12} // Adjust stroke width for each shape
              fill={stageIndex === 1 ? '#ccc' : 'none'} // Add fill only for the circle (stageIndex 1)
              opacity={0.7} // Adjust opacity for each shape
              strokeLinecap="round" // Smooth line endings
              strokeLinejoin="round" // Smooth line joins
            />
          ))}
          {paths.map((path, index) => (
            <Path
              key={`path-${index}`}
              d={path}
              stroke="blue"
              strokeWidth={4} // User-drawn path styling
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