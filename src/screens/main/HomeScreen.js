import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { colors } from '../../theme/colors';
import { privateApi } from '../../utils/api';

const { width, height } = Dimensions.get('window');

const PLACEHOLDER_IMAGE = 'https://randomuser.me/api/portraits/lego/1.jpg';

// ─── Dummy profile detail data (replace with real API fields) ──────────────
const DUMMY_DETAILS = {
  bio: 'Passionate about life, travel, and good coffee. Looking for someone who loves spontaneous adventures and cozy evenings equally. I believe in deep conversations and genuine connections.',
  height: "5'7\"",
  education: 'Masters in Design, NYU',
  relationshipGoal: 'Long-term relationship',
  languages: ['English', 'Spanish'],
  mbti: 'INFJ',
  zodiac: 'Libra',
  exercise: 'Often',
  drinking: 'Socially',
  smoking: 'Never',
  pets: 'Has a dog 🐶',
  location: 'New York, USA',
};

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile detail panel state
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const swiperRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await privateApi.getProfiles();
      if (response?.status && Array.isArray(response.data)) {
        setProfiles(response.data);
        setCardIndex(0);
      } else {
        setError('No profiles found.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load profiles.');
    } finally {
      setLoading(false);
    }
  };

  // ─── API actions ────────────────────────────────────────────────────────────

  const handleLike = async (card) => {
    try {
      await privateApi.likeUser(card.id);
    } catch (err) {
      console.log('Like error:', err);
    }
  };

  const handleDislike = async (card) => {
    try {
      await privateApi.dislikeUser(card.id);
    } catch (err) {
      console.log('Dislike error:', err);
    }
  };

  const handleSave = async (card) => {
    try {
      await privateApi.saveProfile(card.id); // adjust endpoint name as needed
    } catch (err) {
      console.log('Save error:', err);
    }
  };

  // ─── Button press handlers (use current card at cardIndex) ─────────────────

  const onPressDislike = () => {
    // console.log('dislike..............');
    swiperRef.current?.swipeLeft();
  };

  const onPressLike = () => {
    swiperRef.current?.swipeRight();
  };

  const onPressSave = () => {
    const currentCard = profiles[cardIndex];
    if (currentCard) handleSave(currentCard);
  };

  // ─── Profile detail panel ──────────────────────────────────────────────────

  const openDetail = (card) => {
    setSelectedProfile(card);
    setDetailVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeDetail = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDetailVisible(false);
      setSelectedProfile(null);
    });
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getProfileImage = (images) => {
    if (images && images.length > 0) return { uri: images[0] };
    return { uri: PLACEHOLDER_IMAGE };
  };

  // ─── Card renderer ─────────────────────────────────────────────────────────

  const renderCard = (card) => {
    if (!card) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.97}
        style={styles.card}
        onPress={() => openDetail(card)}
      >
        <Image
          source={getProfileImage(card.images)}
          style={styles.cardImage}
          defaultSource={{ uri: PLACEHOLDER_IMAGE }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(26,26,46,0.93)']}
          style={styles.cardOverlay}
        >
          {card.interests && card.interests.length > 0 && (
            <View style={styles.interestsRow}>
              {card.interests.slice(0, 3).map((interest, idx) => (
                <View key={idx} style={styles.interestBadge}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.cardName}>
            {card.name} | {card.age}
          </Text>
          <Text style={styles.cardProfession}>{card.occupation}</Text>

          {/* Tap hint */}
          <View style={styles.tapHint}>
            <Ionicons name="chevron-up" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.tapHintText}>Tap to view profile</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ─── Detail Panel ──────────────────────────────────────────────────────────

  const renderDetailPanel = () => {
    if (!selectedProfile) return null;
    const p = selectedProfile;
    const details = { ...DUMMY_DETAILS, ...p }; // real fields override dummies

    return (
      <Modal
        visible={detailVisible}
        transparent
        animationType="none"
        onRequestClose={closeDetail}
      >
        <TouchableWithoutFeedback onPress={closeDetail}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.detailPanel, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hero image */}
            <View style={styles.detailHero}>
              <Image
                source={getProfileImage(p.images)}
                style={styles.detailHeroImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(15,12,35,0.95)']}
                style={styles.detailHeroOverlay}
              >
                <Text style={styles.detailName}>
                  {p.name || 'Sarah'}, {p.age || 26}
                </Text>
                <View style={styles.detailLocationRow}>
                  <Ionicons name="location" size={14} color={colors.secondary} />
                  <Text style={styles.detailLocation}>
                    {details.location || 'New York, USA'}
                  </Text>
                </View>
              </LinearGradient>

              {/* Close button */}
              <TouchableOpacity style={styles.detailClose} onPress={closeDetail}>
                <Ionicons name="chevron-down" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailBody}>
              {/* Occupation */}
              {p.occupation && (
                <View style={styles.detailInfoRow}>
                  <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailInfoText}>{p.occupation}</Text>
                </View>
              )}

              {/* Education */}
              <View style={styles.detailInfoRow}>
                <Ionicons name="school-outline" size={16} color={colors.primary} />
                <Text style={styles.detailInfoText}>{details.education}</Text>
              </View>

              {/* Height */}
              <View style={styles.detailInfoRow}>
                <Ionicons name="body-outline" size={16} color={colors.primary} />
                <Text style={styles.detailInfoText}>{details.height}</Text>
              </View>

              {/* Relationship goal */}
              <View style={styles.detailInfoRow}>
                <Ionicons name="heart-outline" size={16} color={colors.primary} />
                <Text style={styles.detailInfoText}>{details.relationshipGoal}</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Bio */}
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{details.bio}</Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Interests */}
              {p.interests && p.interests.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Interests</Text>
                  <View style={styles.tagsWrap}>
                    {p.interests.map((interest, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {/* Lifestyle grid */}
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.lifestyleGrid}>
                {[
                  { icon: 'fitness-outline', label: 'Exercise', value: details.exercise },
                  { icon: 'wine-outline', label: 'Drinking', value: details.drinking },
                  { icon: 'flame-outline', label: 'Smoking', value: details.smoking },
                  { icon: 'paw-outline', label: 'Pets', value: details.pets },
                  { icon: 'planet-outline', label: 'MBTI', value: details.mbti },
                  { icon: 'star-outline', label: 'Zodiac', value: details.zodiac },
                ].map((item, idx) => (
                  <View key={idx} style={styles.lifestyleCard}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                    <Text style={styles.lifestyleValue}>{item.value}</Text>
                    <Text style={styles.lifestyleLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Languages */}
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.tagsWrap}>
                {(details.languages || ['English']).map((lang, idx) => (
                  <View key={idx} style={[styles.tag, styles.tagOutline]}>
                    <Text style={[styles.tagText, styles.tagTextOutline]}>{lang}</Text>
                  </View>
                ))}
              </View>

              {/* Extra images */}
              {p.images && p.images.length > 1 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.photoStrip}>
                      {p.images.slice(1).map((img, idx) => (
                        <Image key={idx} source={{ uri: img }} style={styles.photoThumb} />
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Action row inside detail */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.detailActionBtn}
                  onPress={() => { closeDetail(); setTimeout(() => swiperRef.current?.swipeLeft(), 350); }}
                >
                  <Ionicons name="close" size={28} color="#FF6B6B" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailActionBtn, styles.detailActionBtnLarge]}
                  onPress={() => { closeDetail(); setTimeout(() => swiperRef.current?.swipeRight(), 350); }}
                >
                  <LinearGradient colors={['#FF6B6B', '#FFD93D']} style={styles.detailLikeGrad}>
                    <Ionicons name="heart" size={30} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailActionBtn}
                  onPress={() => { handleSave(p); closeDetail(); }}
                >
                  <Ionicons name="star" size={28} color={colors.accent} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 32 }} />
            </View>
          </ScrollView>
        </Animated.View>
      </Modal>
    );
  };

  // ─── Main render ───────────────────────────────────────────────────────────

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
        <TouchableOpacity
          onPress={() => navigation.navigate('Filter')}
          style={styles.filterBtn}
        >
          <Ionicons name="options" size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding matches...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="heart-dislike-outline" size={64} color={colors.textMuted} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchProfiles}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : profiles.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={styles.errorText}>No profiles available</Text>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={profiles}
            cardIndex={cardIndex}
            renderCard={renderCard}
            onSwipedLeft={(index) => handleDislike(profiles[index])}
            onSwipedRight={(index) => handleLike(profiles[index])}
            onSwipedAll={fetchProfiles}
            onSwiped={(index) => setCardIndex(index + 1)}
            cardVerticalMargin={0}
            stackSize={3}
            stackSeparation={12}
            // ✅ Only left/right swipe allowed
            disableBottomSwipe
            disableTopSwipe
            backgroundColor="transparent"
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    color: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    fontSize: 24,
                    fontWeight: '800',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    color: '#4CD964',
                    borderColor: '#4CD964',
                    fontSize: 24,
                    fontWeight: '800',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
          />
        )}
      </View>

      {/* ✅ Action buttons — cross = dislike, heart = like, star = save */}
      {!loading && !error && profiles.length > 0 && (
        <View style={styles.actionsRow}>
          {/* Dislike */}
          <TouchableOpacity style={styles.actionBtn} onPress={onPressDislike}>
            <Ionicons name="close" size={28} color="#FF6B6B" />
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity style={styles.actionBtnLarge} onPress={onPressLike}>
            <LinearGradient colors={['#FF6B6B', '#FFD93D']} style={styles.likeGradient}>
              <Ionicons name="heart" size={32} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity style={styles.actionBtn} onPress={onPressSave}>
            <Ionicons name="star" size={28} color={colors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Detail Panel */}
      {renderDetailPanel()}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FF', paddingBottom: 80 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 56,
  },
  locationLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 48,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchText: { flex: 1, color: colors.textMuted, fontSize: 14 },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  swiperContainer: { flex: 1, marginTop: 16 },

  card: {
    width: width - 40,
    height: height * 0.52,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  interestBadge: {
    backgroundColor: 'rgba(108,63,197,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  interestText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cardProfession: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic',
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  actionBtnLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  likeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
  errorText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 24,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // ── Detail Panel ────────────────────────────────────────────────────────────

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  detailPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.88,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0D9F5',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  detailHero: {
    width: '100%',
    height: 320,
  },
  detailHeroImage: {
    width: '100%',
    height: '100%',
  },
  detailHeroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 20,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  detailLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  detailLocation: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  detailClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailInfoText: {
    fontSize: 14,
    color: '#3D3D5C',
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0EBF8',
    marginVertical: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#5A5A7A',
    lineHeight: 22,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EDE8FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  tagOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  tagTextOutline: {
    color: colors.primary,
  },

  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  lifestyleCard: {
    width: (width - 60) / 3,
    backgroundColor: '#F8F5FF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  lifestyleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  lifestyleLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },

  photoStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  photoThumb: {
    width: 100,
    height: 130,
    borderRadius: 16,
  },

  detailActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 28,
  },
  detailActionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailActionBtnLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 7,
    backgroundColor: 'transparent',
  },
  detailLikeGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});