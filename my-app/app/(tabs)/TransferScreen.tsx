import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TransferScreen() {
  const router = useRouter();
  const { name, ssn, highLevel, score, averageTime, age } = useLocalSearchParams();
  const [firstTap, setFirstTap] = useState(false);

  const handleTap = () => {
    if (!firstTap) {
      setFirstTap(true);
    } else {
      router.push({
        pathname: '/TracingGame',
        params: {
          name,
          ssn,
          highLevel,
          score,
          averageTime,
          age,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Trace the shapes quickly but accurately. Points will be lost for marking outside the lines or not filling shapes completely
      </Text>
      <Text style={styles.subText}>
        {firstTap ? 'Tap again to start' : 'Tap twice to start'}
      </Text>

      <TouchableOpacity
        style={styles.fullscreenButton}
        onPress={handleTap}
        activeOpacity={1}
      />
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
  instructions: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: '#666',
  },
  fullscreenButton: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});