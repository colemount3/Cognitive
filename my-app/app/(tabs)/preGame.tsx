import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function PreGame() {
  const [name, setName] = useState(undefined);
  const [ssn, setSSN] = useState(undefined);
  const [highLevel, setHighLevel] = useState(undefined);
  const router = useRouter();

  const startGame = () => {
    if (
      (name || '').trim() === '' ||
      (ssn || '').trim().length !== 4 ||
      !/^[1-9]$|^10$/.test((highLevel || '').trim())
    ) {
      Alert.alert('Error', 'Please enter your name, last 4 of SSN, and a number from 1 to 10 for how high you are.');
      setName(undefined); // Reset to undefined to show placeholder
      setSSN(undefined);
      setHighLevel(undefined);
      return;
    }

    router.push({
      pathname: '/reactionTransfer',
      params: { name, ssn, highLevel, reset: 'true' },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Info</Text>
      <Text style={styles.subtitle}>Please enter your name, last 4 of SSN, and a number from 1 to 10 for how high you are.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name || undefined}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last 4 of SSN"
        placeholderTextColor="#999"
        value={ssn || undefined}
        onChangeText={setSSN}
        keyboardType="numeric"
        maxLength={4}
      />

      <TextInput
        style={styles.input}
        placeholder="1 (sober) to 10 (very high)"
        placeholderTextColor="#999"
        value={highLevel || undefined}
        onChangeText={setHighLevel}
        keyboardType="numeric"
        maxLength={2}
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});