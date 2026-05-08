import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Match Mingle:',
    subtitle: 'Where Your Story Begins',
    desc: 'Discover people who truly match your vibe, values, and vision.',
    emoji: '💫',
  },
  {
    id: '2',
    title: 'Search Filter:',
    subtitle: 'Find People Around You',
    desc: 'Filter by interests, location, age and more to find your perfect match.',
    emoji: '🔍',
  },
  {
    id: '3',
    title: 'Live Chat:',
    subtitle: 'Foster Immediate Interaction',
    desc: 'Connect instantly and start meaningful conversations right away.',
    emoji: '💬',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Auth');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient colors={['#F8F5FF', '#EDE8FF']} style={styles.emojiContainer}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </LinearGradient>
            <Text style={styles.title}>{item.title} <Text style={styles.titleBold}>{item.subtitle}</Text></Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
          <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.nextBtnGradient}>
            <Text style={styles.nextText}>{currentIndex === slides.length - 1 ? "Let's Go!" : "Next"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FF' },
  slide: { width, padding: 32, paddingTop: 80, alignItems: 'center' },
  emojiContainer: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, color: colors.textSecondary, fontWeight: '400', textAlign: 'center', lineHeight: 38 },
  titleBold: { color: colors.primary, fontWeight: '800' },
  desc: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: colors.primary },
  buttonsRow: { flexDirection: 'row', paddingHorizontal: 32, paddingBottom: 48, gap: 16 },
  skipBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 50, justifyContent: 'center', alignItems: 'center', height: 52 },
  skipText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  nextBtn: { flex: 2, borderRadius: 50, overflow: 'hidden' },
  nextBtnGradient: { height: 52, justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});