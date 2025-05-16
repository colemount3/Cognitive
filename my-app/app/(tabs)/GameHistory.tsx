import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

type GameHistoryEntry = {
  name: string;
  ssn: string;
  highLevel: string;
  tracingScore: string | number;
  score: string | number;
  averageTime: string | number;
  date: string;
};

export default function GameHistory() {
  const { name, ssn, highLevel, tracingScore, score, averageTime } = useLocalSearchParams();
  const playerName = typeof name === 'string' ? name : '';
  const playerSSN = typeof ssn === 'string' ? ssn : '';
  const playerHighLevel = typeof highLevel === 'string' ? highLevel : '';
  const playerTracingScore = typeof tracingScore === 'string' || typeof tracingScore === 'number' ? tracingScore : '';
  const playerScore = typeof score === 'string' || typeof score === 'number' ? score : '';
  const playerAverageTime = typeof averageTime === 'string' || typeof averageTime === 'number' ? averageTime : '';

  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        try {
          const stored = await AsyncStorage.getItem('gameHistory');
          let parsed = stored ? JSON.parse(stored) : [];
          // If we have a new entry from params, show it at the top (not persisted)
          if (playerName) {
            parsed = [
              {
                name: playerName,
                ssn: playerSSN,
                highLevel: playerHighLevel,
                tracingScore: playerTracingScore,
                score: playerScore,
                averageTime: playerAverageTime,
                date: new Date().toISOString(),
              },
              ...parsed,
            ];
          }
          setHistory(parsed);
        } catch (err) {
          console.warn('Failed to load history:', err);
        } finally {
          setLoading(false);
        }
      };
            console.log('DEBUG: HISTORY AVT is', playerAverageTime);/////////////////////////////

      loadHistory();
    }, [playerName, playerSSN, playerHighLevel, playerTracingScore, playerScore, playerAverageTime])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game History</Text>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game History</Text>
        <Text style={styles.emptyText}>No game history available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>
      <ScrollView>
        {history
          .slice()
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          })
          .map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}>Name: {entry.name}</Text>
              <Text style={styles.cardText}>SSN: ***-**-{entry.ssn?.slice(-4) || 'XXXX'}</Text>
              <Text style={styles.cardText}>THC Intoxication Level: {entry.highLevel || 'N/A'}</Text>
              <Text style={styles.cardText}>Tracing Score: {entry.tracingScore ?? 'N/A'}</Text>
              <Text style={styles.cardText}>Score: {entry.score ?? 'N/A'}</Text>
              <Text style={styles.cardText}>
                Avg Time: {entry.averageTime ? (Number(entry.averageTime) / 1000).toFixed(2) + 's' : 'N/A'}
              </Text>
              <Text style={styles.cardText}>
                Date: {entry.date ? new Date(entry.date).toLocaleString() : 'N/A'}
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});