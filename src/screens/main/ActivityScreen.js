import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  PanResponder,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ─── Theme (matches your project) ────────────────────────────────────────────
const colors = {
  primary: '#6C3FC5',
  secondary: '#FF6B9D',
  accent: '#FFD93D',
  background: '#F8F5FF',
  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A7A',
  textMuted: '#9B9BB4',
  cardBg: '#fff',
  badgeBg: '#EDE8FF',
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_PROFILES = [
  {
    id: '1',
    name: 'Supriti Kundu',
    age: 24,
    height: "5' 6\"",
    location: 'Howrah',
    caste: 'Kayastha',
    occupation: 'Business - Artist',
    income: '₹0-1 Lacs p.a',
    education: 'B.A. (Hons)',
    managedBy: 'Self',
    activeOn: '27/04/26',
    acceptedOn: '07 Dec 25',
    images: ['https://randomuser.me/api/portraits/women/44.jpg'],
    nearby: true,
    photoCount: 12,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    age: 26,
    height: "5' 4\"",
    location: 'Kolkata',
    caste: 'Brahmin',
    occupation: 'Software Engineer',
    income: '₹5-7 Lacs p.a',
    education: 'B.Tech',
    managedBy: 'Self',
    activeOn: '15/05/26',
    acceptedOn: '10 Jan 26',
    images: ['https://randomuser.me/api/portraits/women/68.jpg'],
    nearby: false,
    photoCount: 8,
  },
  {
    id: '3',
    name: 'Arpita Das',
    age: 25,
    height: "5' 3\"",
    location: 'Salt Lake',
    caste: 'Vaishnav',
    occupation: 'Teacher',
    income: '₹3-5 Lacs p.a',
    education: 'M.A.',
    managedBy: 'Parents',
    activeOn: '14/05/26',
    acceptedOn: '02 Feb 26',
    images: ['https://randomuser.me/api/portraits/women/32.jpg'],
    nearby: true,
    photoCount: 5,
  },
];

const PLACEHOLDER = 'https://randomuser.me/api/portraits/lego/1.jpg';

// ─── Swipeable Profile Card ───────────────────────────────────────────────────
function SwipeCard({ profile, onChat, onContact, onCancel, style }) {
  return (
    <Animated.View style={[styles.profileCard, style]}>
      <Image
        source={{ uri: profile.images?.[0] || PLACEHOLDER }}
        style={styles.profileCardImage}
      />

      {/* Top badges */}
      <View style={styles.cardTopRow}>
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedBadgeText}>
            They accepted interest{'\n'}on {profile.acceptedOn}
          </Text>
        </View>
        <View style={styles.photoBadge}>
          <Ionicons name="images-outline" size={12} color="#fff" />
          <Text style={styles.photoBadgeText}>{profile.photoCount}</Text>
        </View>
      </View>

      {/* Nearby tag */}
      {profile.nearby && (
        <View style={styles.nearbyBadge}>
          <Text style={styles.nearbyBadgeText}>Nearby</Text>
        </View>
      )}

      {/* Bottom info overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(10,8,30,0.92)']}
        style={styles.cardOverlay}
      >
        <Text style={styles.cardActiveText}>Active on {profile.activeOn}</Text>
        <Text style={styles.cardName}>{profile.name}, {profile.age}</Text>
        <Text style={styles.cardDetails}>
          {profile.height} · {profile.location} · {profile.caste}
        </Text>
        <Text style={styles.cardDetails}>
          {profile.occupation} · Earns {profile.income}
        </Text>
        <Text style={styles.cardDetails}>{profile.education}</Text>
        <Text style={styles.cardManagedBy}>Profile managed by {profile.managedBy}</Text>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardActionBtn} onPress={onChat}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.cardActionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardActionBtn} onPress={onContact}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.cardActionText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardActionBtn, styles.cancelBtn]} onPress={onCancel}>
            <Ionicons name="mail-unread-outline" size={20} color="#fff" />
            <Text style={styles.cardActionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Main Activity Screen ─────────────────────────────────────────────────────
export default function ActivityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Accepted');
  const [cardIndex, setCardIndex] = useState(0);

  const TABS = ['Received', 'Accepted (14)', 'Sent (99+)'];
  const profiles = DUMMY_PROFILES;

  // Swipe pan
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeDir = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 100) {
          const dir = g.dx > 0 ? width * 1.5 : -width * 1.5;
          Animated.timing(pan.x, {
            toValue: dir,
            duration: 280,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            setCardIndex((prev) => (prev + 1) % profiles.length);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
    extrapolate: 'clamp',
  });

  const currentProfile = profiles[cardIndex];
  const nextProfile = profiles[(cardIndex + 1) % profiles.length];

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={styles.notifDot}>
              <Text style={styles.notifDotText}>1</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Profile\nVisits', value: 0, color: '#6C3FC5' },
            { label: 'Shortlisted\nProfiles', value: 0, color: '#E8A000' },
            { label: 'Contact\nViews', value: 0, color: '#2A80E1' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statCircle, { borderColor: stat.color + '40', backgroundColor: stat.color + '15' }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Interests Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab || (tab.startsWith(activeTab));
            const active = tab.startsWith('Accepted') && activeTab === 'Accepted'
              || tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab.split(' ')[0])}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Swipeable Card Stack ── */}
        <View style={styles.cardStack}>
          {/* Back card (next) */}
          {nextProfile && (
            <View style={[styles.profileCard, styles.backCard]}>
              <Image
                source={{ uri: nextProfile.images?.[0] || PLACEHOLDER }}
                style={styles.profileCardImage}
              />
            </View>
          )}

          {/* Front card (current) — swipeable */}
          {currentProfile && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.profileCard,
                {
                  transform: [
                    { translateX: pan.x },
                    { rotate },
                  ],
                },
              ]}
            >
              <Image
                source={{ uri: currentProfile.images?.[0] || PLACEHOLDER }}
                style={styles.profileCardImage}
              />

              {/* Top badges */}
              <View style={styles.cardTopRow}>
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedBadgeText}>
                    They accepted interest{'\n'}on {currentProfile.acceptedOn}
                  </Text>
                </View>
                <View style={styles.photoBadge}>
                  <Ionicons name="images-outline" size={12} color="#fff" />
                  <Text style={styles.photoBadgeText}>{currentProfile.photoCount}</Text>
                </View>
              </View>

              {/* Nearby */}
              {currentProfile.nearby && (
                <View style={styles.nearbyBadge}>
                  <Text style={styles.nearbyBadgeText}>Nearby</Text>
                </View>
              )}

              {/* Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(10,8,30,0.92)']}
                style={styles.cardOverlay}
              >
                <Text style={styles.cardActiveText}>Active on {currentProfile.activeOn}</Text>
                <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
                <Text style={styles.cardDetails}>
                  {currentProfile.height} · {currentProfile.location} · {currentProfile.caste}
                </Text>
                <Text style={styles.cardDetails}>
                  {currentProfile.occupation} · Earns {currentProfile.income}
                </Text>
                <Text style={styles.cardDetails}>{currentProfile.education}</Text>
                <Text style={styles.cardManagedBy}>
                  Profile managed by {currentProfile.managedBy}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardActionBtn}>
                    <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                    <Text style={styles.cardActionText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardActionBtn}>
                    <Ionicons name="call-outline" size={20} color="#fff" />
                    <Text style={styles.cardActionText}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cardActionBtn, styles.cancelBtn]}>
                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.cardActionText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Swipe hint overlays */}
              <Animated.View
                style={[
                  styles.swipeHint,
                  styles.swipeHintLike,
                  {
                    opacity: pan.x.interpolate({
                      inputRange: [20, 80],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                <Text style={styles.swipeHintTextLike}>LIKE</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.swipeHint,
                  styles.swipeHintNope,
                  {
                    opacity: pan.x.interpolate({
                      inputRange: [-80, -20],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                <Text style={styles.swipeHintTextNope}>NOPE</Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.bottomBar}>
        {[
          { icon: 'heart-outline', label: 'Matches' },
          { icon: 'pulse', label: 'Activity', active: true },
          { icon: 'chatbubbles-outline', label: 'Messenger' },
          { icon: 'diamond-outline', label: 'Upgrade', upgrade: true },
        ].map((tab, i) => (
          <TouchableOpacity key={i} style={styles.bottomTab}>
            {tab.upgrade ? (
              <View style={styles.upgradeBadge}>
                <Text style={styles.upgradeBadgeText}>75% OFF</Text>
              </View>
            ) : (
              <Ionicons
                name={tab.icon}
                size={24}
                color={tab.active ? colors.secondary : colors.textMuted}
              />
            )}
            <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>
              {tab.label}
            </Text>
            {tab.active && <View style={styles.activeTabDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBF8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0EBF8',
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 15,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '700',
  },

  // Tabs
  tabsRow: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 18,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D4CAE8',
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#FFE8F0',
    borderColor: colors.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.secondary,
  },

  // Card stack
  cardStack: {
    alignItems: 'center',
    height: height * 0.62,
    marginHorizontal: 16,
  },
  backCard: {
    position: 'absolute',
    top: 8,
    transform: [{ scale: 0.96 }],
    zIndex: 0,
    opacity: 0.7,
  },
  profileCard: {
    width: width - 32,
    height: height * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  profileCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Card top badges
  cardTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  acceptedBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: '70%',
  },
  acceptedBadgeText: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  photoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Nearby badge
  nearbyBadge: {
    position: 'absolute',
    top: 70,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nearbyBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Card overlay
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingTop: 48,
    paddingBottom: 14,
  },
  cardActiveText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cardName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardDetails: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  cardManagedBy: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 10,
  },

  // Card action buttons
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,100,100,0.25)',
    borderColor: 'rgba(255,100,100,0.4)',
  },
  cardActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Swipe hints
  swipeHint: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 3,
  },
  swipeHintLike: {
    left: 16,
    borderColor: '#4CD964',
    backgroundColor: 'rgba(76,217,100,0.15)',
  },
  swipeHintNope: {
    right: 16,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.15)',
  },
  swipeHintTextLike: {
    color: '#4CD964',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  swipeHintTextNope: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0EBF8',
    paddingBottom: 16,
    paddingTop: 8,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  bottomTabText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  bottomTabTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  activeTabDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  upgradeBadge: {
    backgroundColor: '#F0EBF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  upgradeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
});
