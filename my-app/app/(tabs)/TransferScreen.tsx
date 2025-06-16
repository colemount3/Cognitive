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
        KEEP CONTROL!   
        {'\n\n'}Swipe left or right to stay in the lanes.  
        {'\n'}Leaving the lanes will lower your score.  
        {'\n'}Stay in your lane at all costs.  
       
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
    paddingHorizontal: 20,
  },
  instructions: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
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
