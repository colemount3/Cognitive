// app/TransferScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TransferScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Trace the shapes quickly but accurately.
      </Text>
      <Text style={styles.subText}>Tap anywhere to start</Text>

      <TouchableOpacity
        style={styles.fullscreenButton}
        onPress={() => router.push('/TracingGame')}
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
