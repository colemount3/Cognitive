import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function GameHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        console.log('Loading game history...');
        try {
          const stored = await AsyncStorage.getItem('gameHistory');
          console.log('[DEBUG] Retrieved:', stored);
          if (stored) {
            setHistory(JSON.parse(stored));
          }
        } catch (err) {
          console.warn('Failed to load history:', err);
        } finally {
          setLoading(false);
        }
      };

      loadHistory();
    }, [])
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
        {[...history].reverse().map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>Name: {entry.name || 'Unknown'}</Text>
            <Text style={styles.cardText}>SSN: ***-**-{entry.ssn?.slice(-4) || 'XXXX'}</Text>
            <Text style={styles.cardText}>THC Intoxication Level: {entry.highLevel || 'N/A'}</Text>
            <Text style={styles.cardText}>Score: {entry.score ?? 'N/A'}</Text>
            <Text style={styles.cardText}>Avg Time: {(Number(entry.averageTime) / 1000).toFixed(2)}s</Text>
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