import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start(() => {
      // After appear, loop heartbeat
      Animated.loop(
        Animated.sequence([
          Animated.spring(heartBounce, { toValue: 1.25, speed: 8, useNativeDriver: true }),
          Animated.spring(heartBounce, { toValue: 1, speed: 8, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <LinearGradient colors={['#6C3FC5', '#9B6EE8', '#FF6B6B']} style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.Text style={[styles.logo, { transform: [{ scale: heartBounce }] }]}>
          💕
        </Animated.Text>
        <Text style={styles.appName}>Match Mingle</Text>
        <Text style={styles.tagline}>Where Your Story Begins</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logo: { fontSize: 64, marginBottom: 16 },
  appName: { fontSize: 36, color: '#fff', fontWeight: '800', letterSpacing: 1 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, letterSpacing: 2 },
});