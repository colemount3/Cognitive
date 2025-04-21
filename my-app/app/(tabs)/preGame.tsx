// app/(tabs)/pregame.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function PreGame() {
  const [name, setName] = useState('default');
  const [ssn, setSSN] = useState('1234');
  const router = useRouter();

  const startGame = () => {
    if (name.trim() === '' || ssn.trim().length !== 4) {
      Alert.alert('Error', 'Please enter your name and the last 4 digits of your SSN.');
      return;
    }

    // Reset game state here if necessary, or handle logic before navigation
    router.push({
      pathname: '/game',
      params: { name, ssn, reset: 'true',},
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Info</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last 4 of SSN"
        value={ssn}
        onChangeText={setSSN}
        keyboardType="numeric"
        maxLength={4}
      />
      <Button title="Start Game" onPress={startGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
