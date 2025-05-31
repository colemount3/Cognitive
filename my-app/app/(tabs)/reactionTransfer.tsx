import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PreMemoryGame() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name, ssn, age } = params;
console.log('DEBUG pregame:', { name, ssn, age });
  const handleStart = () => {
    router.push({
      pathname: '/game',
      params: { name, ssn, age, reset: 'true' },
    });
  };

  return (
    <Pressable style={styles.container} onPress={handleStart}>
      <View>
        <Text style={styles.title}>Get Ready!</Text>
        <Text style={styles.instruction}>
          When the brake lights turn on, press anywhere on the screen.
        </Text>
        <Text style={styles.instruction}>
          Press anywhere to begin.
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 20,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
});