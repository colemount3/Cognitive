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
  age: string | number;
  date: string;
};

export default function GameHistory() {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      const loadAndMaybeAddHistory = async () => {
        try {
          const stored = await AsyncStorage.getItem('gameHistory');
          let parsed: GameHistoryEntry[] = stored ? JSON.parse(stored) : [];

          if (params && params.name) {
            const newEntry: GameHistoryEntry = {
              name: params.name as string,
              ssn: params.ssn as string,
              highLevel: (params.highLevel ?? '') as string,
              tracingScore: Array.isArray(params.tracingScore)
                ? params.tracingScore[0] ?? ''
                : params.tracingScore ?? '',
              score: Array.isArray(params.score)
                ? params.score[0] ?? ''
                : params.score ?? '',
              averageTime: Array.isArray(params.averageTime)
                ? params.averageTime[0] ?? ''
                : params.averageTime ?? '',
              age: Array.isArray(params.age) ? params.age[0] ?? '' : params.age ?? '',
              date: params.date ? String(params.date) : new Date().toISOString(),
            };
            if (!parsed.find(e => e.date === newEntry.date && e.name === newEntry.name)) {
              parsed = [newEntry, ...parsed];
              await AsyncStorage.setItem('gameHistory', JSON.stringify(parsed));
            }
          }

          setHistory(parsed);
        } catch (err) {
          console.warn('Failed to load history:', err);
        } finally {
          setLoading(false);
        }
      };
      loadAndMaybeAddHistory();
    }, [params])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Evaluation History</Text>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Evaluation History</Text>
        <Text style={styles.emptyText}>No evaluation history available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluation History</Text>
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
              <Text style={styles.cardText}>ID Code: {entry.ssn?.slice(-4) || 'XXXX'}</Text>
              <Text style={styles.cardText}>Driving Score: {entry.tracingScore || 'N/A'} /1000</Text>
              <Text style={styles.cardText}>Age: {entry.age || 'N/A'}</Text>
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