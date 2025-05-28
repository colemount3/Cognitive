import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function PreGame() {
  const [name, setName] = useState<string | undefined>(undefined);
  const [ssn, setSSN] = useState<string | undefined>(undefined);
  const [highLevel, setHighLevel] = useState<string | undefined>(undefined);
  const [age, setAge] = useState<string | undefined>(undefined);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      setName(undefined);
      setSSN(undefined);
      setHighLevel(undefined);
      setAge(undefined);
    }, [])
  );

  const startGame = () => {
    if (
      (name || '').trim() === '' ||
      (ssn || '').trim().length !== 4 ||
      !/^[1-9]$|^10$/.test((highLevel || '').trim())
    ) {
      Alert.alert('Error', 'Please enter your name, last 4 of SSN, and a number from 1 to 10 for how high you are.');
      setName(undefined); //  show placeholder
      setSSN(undefined);
      setHighLevel(undefined);
      return;
    }

    router.push({
      pathname: '/reactionTransfer',
      params: { name, ssn, highLevel, age, reset: 'true' },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Info</Text>
      <Text style={styles.subtitle}>
        Please enter your name, last 4 of SSN, age, and a number from 1 to 10 for how high you are.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name ?? ''}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Pick a 4 digit code, use same code every time"
        placeholderTextColor="#999"
        value={ssn ?? ''}
        onChangeText={setSSN}
        keyboardType="numeric"
        maxLength={4}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#999"
        value={age ?? ''}
        onChangeText={setAge}
        keyboardType="numeric"
        maxLength={2}
      />

      <TextInput
        style={styles.input}
        placeholder="1 (sober) to 10 (passed out)"
        placeholderTextColor="#999"
        value={highLevel ?? ''}
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