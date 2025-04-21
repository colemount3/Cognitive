import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function GameHistory() {
  const { history, numResponses, averageResponseTime } = useLocalSearchParams();

  let parsedHistory: any[] = [];

  try {
    if (history) {
      parsedHistory = JSON.parse(decodeURIComponent(history as string)); // 🔥 Fix: decode before parsing
    }
  } catch (err) {
    console.warn('Failed to parse game history:', err);
  }

  const isValidHistory = Array.isArray(parsedHistory) && parsedHistory.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>
      <ScrollView>
        {!isValidHistory ? (
          <Text style={styles.emptyText}>No game history available.</Text>
        ) : (
          parsedHistory.map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text>Name: {entry.name || 'Unknown'}</Text>
              <Text>SSN: ***-**-{entry.ssn?.slice(-4) || 'XXXX'}</Text>
              <Text>Score: {numResponses}</Text>
              <Text>Avg Time: {(Number(averageResponseTime) / 1000).toFixed(2)}s</Text>
            </View>
          ))
        )}

       
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  statsCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
});
