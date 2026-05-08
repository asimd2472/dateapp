import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { publicApi } from '../../utils/api';

const { width } = Dimensions.get('window');

const INTERESTS = [
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'hiking', label: 'Hiking', emoji: '🏔️' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'dancing', label: 'Dancing', emoji: '💃' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'pets', label: 'Pets', emoji: '🐾' },
  { id: 'tech', label: 'Technology', emoji: '💻' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'foodie', label: 'Foodie', emoji: '🍜' },
  { id: 'volunteering', label: 'Volunteering', emoji: '🤝' },
  { id: 'meditation', label: 'Meditation', emoji: '🌿' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
];

const MIN_INTERESTS = 3;

export default function InterestsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const chipAnims = useRef(INTERESTS.map(() => new Animated.Value(0))).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ...chipAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1, duration: 350,
          delay: 300 + i * 40,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  useEffect(() => {
    const progress = Math.min(selected.length / MIN_INTERESTS, 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const toggleInterest = (id) => {
    setError('');
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

    // Tap pulse
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleFinish = async () => {
    if (selected.length < MIN_INTERESTS) {
      setError(`Please pick at least ${MIN_INTERESTS} interests`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      await publicApi.updateInterests(selected, token);
      // Navigate to main home — reset stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, MIN_INTERESTS - selected.length);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color="#6C3FC5" />
      </TouchableOpacity>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Final Step</Text>
        </View>
        <Text style={styles.title}>Your Interests</Text>
        <Text style={styles.sub}>
          Select at least <Text style={styles.highlight}>{MIN_INTERESTS}</Text> things you love
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressLabel}>
          {selected.length} selected
          {remaining > 0 ? ` · ${remaining} more to go` : ' · You\'re all set! 🎉'}
        </Text>
      </Animated.View>

      {/* Chips grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {INTERESTS.map((item, index) => {
          const isActive = selected.includes(item.id);
          return (
            <Animated.View
              key={item.id}
              style={{
                opacity: chipAnims[index],
                transform: [{ scale: chipAnims[index].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
              }}
            >
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleInterest(item.id)}
                activeOpacity={0.8}
              >
                {isActive && (
                  <LinearGradient
                    colors={['#6C3FC5', '#9B6EE8']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {item.label}
                </Text>
                {isActive && (
                  <View style={styles.chipCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btn, (selected.length < MIN_INTERESTS || loading) && styles.btnDim]}
          onPress={handleFinish}
          disabled={loading}
          activeOpacity={0.87}
        >
          <LinearGradient
            colors={selected.length >= MIN_INTERESTS ? ['#6C3FC5', '#9B6EE8'] : ['#C4B8E8', '#C4B8E8']}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.btnText}>Complete Setup</Text>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5FF' },

  bgCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(108,63,197,0.06)',
  },
  bgCircle2: {
    position: 'absolute', top: 120, left: -80,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(155,110,232,0.05)',
  },

  back: {
    position: 'absolute', top: 54, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE8FF',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },

  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE8FF',
    borderRadius: 50,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 12,
  },
  stepText: { fontSize: 12, color: '#6C3FC5', fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '900', color: '#2D1B69', marginBottom: 6 },
  sub: { fontSize: 14, color: '#7B6A9A', lineHeight: 22, marginBottom: 20 },
  highlight: { color: '#6C3FC5', fontWeight: '800' },

  progressTrack: {
    height: 6, backgroundColor: '#EDE8FF', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: 6, borderRadius: 3,
    backgroundColor: '#6C3FC5',
  },
  progressLabel: {
    fontSize: 12, color: '#9B6EE8', fontWeight: '600',
    marginTop: 8, marginBottom: 4,
  },

  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 12,
    paddingTop: 8,
  },

  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 50,
    borderWidth: 1.5, borderColor: '#DDD6F5',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 1,
  },
  chipActive: { borderColor: 'transparent' },
  chipEmoji: { fontSize: 16, marginRight: 6 },
  chipLabel: { fontSize: 13, color: '#4B3A8A', fontWeight: '600' },
  chipLabelActive: { color: '#fff', fontWeight: '700' },
  chipCheck: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 6,
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(248,245,255,0.95)',
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#EDE8FF',
  },
  errorRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, justifyContent: 'center', marginBottom: 10,
  },
  errorText: { fontSize: 13, color: '#EF4444' },
  btn: { borderRadius: 50, overflow: 'hidden' },
  btnDim: { opacity: 0.65 },
  btnGradient: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});