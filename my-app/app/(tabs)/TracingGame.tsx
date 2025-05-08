import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import 'react-native-gesture-handler';

const stages = ['Trace the figure 8', 'Completely fill the circle', 'Accurately trace the lines'];
const stageShapes = [
  // Figure 8
  'M150,150 C150,100 250,100 250,150 S150,200 150,150 S250,100 250,150',
  // Circle
  'M150,150 A100,100 0 1,1 150,149.99 Z',
  // Lines
  'M50,50 L100,50 L150,50 L200,50 L250,50 L300,50',
];

const TracingGame = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [path, setPath] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleContinue();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stageIndex]);

  const handleContinue = () => {
    if (stageIndex < stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setPoints([]);
      setPath('');
      setTimeLeft(60);
    } else {
      Alert.alert('Game Complete', 'Scoring will be shown here.');
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const { x, y } = event;
      if (!isFinite(x) || !isFinite(y)) {
        console.warn('Start ignored: invalid coords', x, y);
        return;
      }
      console.log('Gesture start:', x, y);
      setPoints([{ x, y }]);
      setPath(`M${x},${y}`);
    })
    .onUpdate((event) => {
      const { x, y } = event;
      if (!isFinite(x) || !isFinite(y)) {
        console.warn('Update ignored: invalid coords', x, y);
        return;
      }
      console.log('Gesture update:', x, y);
      setPoints((prev) => {
        const updated = [...prev, { x, y }];
        const newPath = updated.map((pt, i) => (i === 0 ? `M${pt.x},${pt.y}` : `L${pt.x},${pt.y}`)).join(' ');
        setPath(newPath);
        return updated;
      });
    })
    .onEnd(() => {
      opacity.value = withTiming(0.5, { duration: 200 }, () => {
        opacity.value = withTiming(1, { duration: 200 });
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracing Game</Text>
      <Text style={styles.subtitle}>{stages[stageIndex]}</Text>
      <Text style={styles.timer}>Time left: {timeLeft}s</Text>

      <View style={styles.canvasContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.canvas, animatedStyle]}>
            <Svg
              width={Dimensions.get('window').width - 40}
              height={Dimensions.get('window').height / 2}
            >
              <Path
                d={stageShapes[stageIndex]}
                stroke="#ccc"
                strokeWidth={2}
                fill="none"
                opacity={0.5}
              />
              <Path
                d={path}
                stroke="blue"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
          </Animated.View>
        </GestureDetector>
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
  canvasContainer: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height / 2,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  canvas: {
    flex: 1,
  },
});
