import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Modal, FlatList,
  Platform, Animated, Image, Pressable, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { publicApi } from '../../utils/api';

const GENDERS = [
  { label: 'Male', value: 'male', icon: 'male' },
  { label: 'Female', value: 'female', icon: 'female' },
  { label: 'Non-binary', value: 'non-binary', icon: 'transgender' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say', icon: 'help-circle' },
];

export default function ProfileSetupScreen({ navigation, route }) {
  const { email } = route.params || {};

  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setCitiesLoading(true);
    try {
      const response = await publicApi.getCities(); // GET /get-city
      if (response?.status === 1) {
        setCities(response.cities || []);
      }
    } catch (e) {
      console.log('City fetch error', e);
    } finally {
      setCitiesLoading(false);
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(cityQuery.toLowerCase())
  );

  // ── Avatar picker ────────────────────────────────────────────
  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      // Crop & compress
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatar(manipulated.uri);
    }
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!occupation.trim()) e.occupation = 'Occupation is required';
    if (!selectedCity) e.city = 'Please select your city';
    if (!gender) e.gender = 'Please select your gender';
    if (!dob) e.dob = 'Date of birth is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', fullName.trim());
      formData.append('occupation', occupation.trim());
      formData.append('city_id', selectedCity.id);
      formData.append('gender', gender);
      formData.append('dob', dob.toISOString().split('T')[0]);
      if (avatar) {
        formData.append('avatar', {
          uri: avatar,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      }

      console.log('formData', formData);
      // await publicApi.updateProfile(formData, token);
      navigation.navigate('Interests');
    } catch (err) {
      console.log('Profile update error', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDob = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 16);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.root}>
        {/* Header gradient strip */}
        <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.headerGradient}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <Text style={styles.headerSub}>Tell us about yourself</Text>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.85}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={38} color="#A78BE8" />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to add photo</Text>
        </LinearGradient>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Full Name */}
          <Field label="Full Name" error={errors.fullName}>
            <View style={[styles.inputRow, errors.fullName && styles.inputError]}>
              <Ionicons name="person-outline" size={18} color="#9B6EE8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#C4B8E8"
                value={fullName}
                onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' })); }}
                autoCapitalize="words"
              />
            </View>
          </Field>

          {/* Occupation */}
          <Field label="Occupation" error={errors.occupation}>
            <View style={[styles.inputRow, errors.occupation && styles.inputError]}>
              <MaterialCommunityIcons name="briefcase-outline" size={18} color="#9B6EE8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Software Engineer"
                placeholderTextColor="#C4B8E8"
                value={occupation}
                onChangeText={(t) => { setOccupation(t); if (errors.occupation) setErrors((e) => ({ ...e, occupation: '' })); }}
                autoCapitalize="words"
              />
            </View>
          </Field>

          {/* City */}
          <Field label="City" error={errors.city}>
            <TouchableOpacity
              style={[styles.inputRow, errors.city && styles.inputError]}
              onPress={() => setShowCityModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={18} color="#9B6EE8" style={styles.inputIcon} />
              <Text style={[styles.input, !selectedCity && { color: '#C4B8E8' }]}>
                {selectedCity ? selectedCity.name : 'Select your city'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9B6EE8" />
            </TouchableOpacity>
          </Field>

          {/* Gender */}
          <Field label="Gender" error={errors.gender}>
            <View style={styles.genderGrid}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.genderChip, gender === g.value && styles.genderChipActive]}
                  onPress={() => { setGender(g.value); if (errors.gender) setErrors((e) => ({ ...e, gender: '' })); }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={g.icon}
                    size={16}
                    color={gender === g.value ? '#fff' : '#9B6EE8'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.genderText, gender === g.value && styles.genderTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Date of Birth */}
          <Field label="Date of Birth" error={errors.dob}>
            <TouchableOpacity
              style={[styles.inputRow, errors.dob && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color="#9B6EE8" style={styles.inputIcon} />
              <Text style={[styles.input, !dob && { color: '#C4B8E8' }]}>
                {dob ? formatDob(dob) : 'Select date of birth'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9B6EE8" />
            </TouchableOpacity>
          </Field>

          {/* Date picker */}
          {showDatePicker && (
            <DateTimePicker
              value={dob || maxDob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maxDob}
              minimumDate={new Date(1950, 0, 1)}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) {
                  setDob(selected);
                  if (errors.dob) setErrors((e) => ({ ...e, dob: '' }));
                }
              }}
            />
          )}

          <View style={{ height: 32 }} />

          {/* Continue */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.87}
          >
            <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.btnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* City Modal */}
        <Modal visible={showCityModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select City</Text>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color="#9B6EE8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search city..."
                  placeholderTextColor="#C4B8E8"
                  value={cityQuery}
                  onChangeText={setCityQuery}
                  autoFocus
                />
                {cityQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setCityQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#C4B8E8" />
                  </TouchableOpacity>
                )}
              </View>

              {citiesLoading ? (
                <ActivityIndicator color="#6C3FC5" size="large" style={{ marginTop: 32 }} />
              ) : (
                <FlatList
                  data={filteredCities}
                  keyExtractor={(item) => String(item.id)}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.cityItem,
                        selectedCity?.id === item.id && styles.cityItemActive,
                      ]}
                      onPress={() => {
                        setSelectedCity(item);
                        setShowCityModal(false);
                        setCityQuery('');
                        if (errors.city) setErrors((e) => ({ ...e, city: '' }));
                      }}
                    >
                      <Ionicons
                        name="location"
                        size={16}
                        color={selectedCity?.id === item.id ? '#6C3FC5' : '#C4B8E8'}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.cityName, selectedCity?.id === item.id && styles.cityNameActive]}>
                        {item.name}
                      </Text>
                      {selectedCity?.id === item.id && (
                        <Ionicons name="checkmark-circle" size={18} color="#6C3FC5" style={{ marginLeft: 'auto' }} />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No cities found</Text>
                  }
                />
              )}

              <TouchableOpacity style={styles.modalClose} onPress={() => setShowCityModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// Reusable field wrapper
function Field({ label, error, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error ? (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: '#6C3FC5', marginBottom: 8, letterSpacing: 0.4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  errorText: { fontSize: 12, color: '#EF4444' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5FF' },

  headerGradient: {
    paddingTop: 54,
    paddingBottom: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  back: {
    position: 'absolute', top: 54, left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  avatarWrap: {
    marginTop: 20,
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'visible',
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#6C3FC5',
    borderWidth: 2, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 },

  scroll: { flex: 1, marginTop: -40 },
  form: {
    marginTop: 0,
    backgroundColor: '#F8F5FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 28,
  },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5, borderColor: '#EDE8FF',
    paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15,
    color: '#2D1B69', fontWeight: '500',
  },

  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genderChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 50, borderWidth: 1.5, borderColor: '#EDE8FF',
    backgroundColor: '#fff',
  },
  genderChipActive: {
    backgroundColor: '#6C3FC5', borderColor: '#6C3FC5',
  },
  genderText: { fontSize: 13, color: '#6C3FC5', fontWeight: '600' },
  genderTextActive: { color: '#fff' },

  btn: { borderRadius: 50, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0D9F5', alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '800', color: '#2D1B69', marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F5FF', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#EDE8FF',
  },
  searchInput: {
    flex: 1, fontSize: 15, color: '#2D1B69', fontWeight: '500',
  },
  cityItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F0FA',
  },
  cityItemActive: { backgroundColor: '#F8F5FF', borderRadius: 10 },
  cityName: { fontSize: 15, color: '#4B3A8A', fontWeight: '500' },
  cityNameActive: { color: '#6C3FC5', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#C4B8E8', marginTop: 32, fontSize: 15 },
  modalClose: {
    marginTop: 16, backgroundColor: '#EDE8FF',
    borderRadius: 50, paddingVertical: 14, alignItems: 'center',
  },
  modalCloseText: { color: '#6C3FC5', fontWeight: '700', fontSize: 15 },
});