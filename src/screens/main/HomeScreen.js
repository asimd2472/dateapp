import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const DUMMY_PROFILES = [
  { id: 1, name: 'Ethan', age: 28, profession: 'Actor, Body Builder', distance: '2.1 KM', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'Sophia', age: 25, profession: 'Fashion Designer', distance: '1.5 KM', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 3, name: 'James', age: 30, profession: 'Software Engineer', distance: '3.2 KM', image: 'https://randomuser.me/api/portraits/men/55.jpg' },
];

export default function HomeScreen({ navigation }) {
  const [cardIndex, setCardIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>Your Location</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={styles.locationText}>New York, USA</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchText}>Search partner</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Filter')} style={styles.filterBtn}>
          <Ionicons name="options" size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        <Swiper
          cards={DUMMY_PROFILES}
          cardIndex={cardIndex}
          renderCard={(card) => (
            <View style={styles.card}>
              <Image source={{ uri: card.image }} style={styles.cardImage} />
              <LinearGradient colors={['transparent', 'rgba(26,26,46,0.9)']} style={styles.cardOverlay}>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{card.distance}</Text>
                </View>
                <Text style={styles.cardName}>{card.name} | {card.age}</Text>
                <Text style={styles.cardProfession}>{card.profession}</Text>
              </LinearGradient>
            </View>
          )}
          onSwipedLeft={() => {}}
          onSwipedRight={() => {}}
          onSwipedAll={() => {}}
          cardVerticalMargin={0}
          stackSize={3}
          stackSeparation={12}
          disableBottomSwipe
          disableTopSwipe
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="close" size={28} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnLarge}>
          <LinearGradient colors={['#FF6B6B', '#FFD93D']} style={styles.likeGradient}>
            <Ionicons name="heart" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="star" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FF', paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  locationLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EDE8FF', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 50, paddingHorizontal: 16, height: 48, gap: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  searchText: { flex: 1, color: colors.textMuted, fontSize: 14 },
  filterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EDE8FF', justifyContent: 'center', alignItems: 'center' },
  swiperContainer: { flex: 1, marginTop: 16 },
  card: { width: width - 40, height: height * 0.52, borderRadius: 24, overflow: 'hidden', alignSelf: 'center' },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 24 },
  distanceBadge: { position: 'absolute', top: -180, right: 16, backgroundColor: 'rgba(108,63,197,0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  distanceText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cardProfession: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 16 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  actionBtnLarge: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', shadowColor: colors.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  likeGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});