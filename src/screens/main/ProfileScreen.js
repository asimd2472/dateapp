import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';

import { AuthContext } from '../../context/AuthContext';

const PLACEHOLDER_IMAGE = 'https://randomuser.me/api/portraits/lego/1.jpg';

const MENU_ITEMS = [
  {
    key: 'personal',
    label: 'Personal Details',
    icon: 'person-circle-outline',
    screen: 'PersonalDetails',
  },
  {
    key: 'support',
    label: 'Support',
    icon: 'headset-outline',
    screen: 'Support',
  },
  {
    key: 'about',
    label: 'About Us',
    icon: 'information-circle-outline',
    screen: 'AboutUs',
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    icon: 'shield-checkmark-outline',
    screen: 'PrivacyPolicy',
  },
  {
    key: 'terms',
    label: 'Terms & Conditions',
    icon: 'document-text-outline',
    screen: 'TermsConditions',
  },
  {
    key: 'delete',
    label: 'Delete Account',
    icon: 'person-remove-outline',
    screen: 'DeleteAccount',
    danger: true,
  },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.log('Failed to load user:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              // Reset to auth stack — adjust the navigator name to match yours
            //   navigation.reset({
            //     index: 0,
            //     routes: [{ name: 'Auth' }],
            //   });
                logout();
            } catch (e) {
              console.log('Logout error:', e);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getProfileImage = () => {
    if (user?.images && user.images.length > 0) {
      return { uri: user.images[0] };
    }
    if (user?.avatar) return { uri: user.avatar };
    return { uri: PLACEHOLDER_IMAGE };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={getProfileImage()} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF6B6B', '#E84545']}
                style={styles.cameraBtnInner}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.name || 'Your Name'}
          </Text>
          {user?.occupation ? (
            <Text style={styles.userOccupation}>{user.occupation}</Text>
          ) : null}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[
                  styles.menuIconBox,
                  item.danger && styles.menuIconBoxDanger,
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? '#E84545' : colors.primary}
                  />
                </View>
                <Text style={[
                  styles.menuLabel,
                  item.danger && styles.menuLabelDanger,
                ]}>
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={item.danger ? '#E84545' : colors.textMuted}
                />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={loggingOut}
        >
          <LinearGradient
            colors={['#FF6B6B', '#E84545']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            {loggingOut ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraBtnInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  userOccupation: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Menu
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconBoxDanger: {
    backgroundColor: '#FFE8E8',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  menuLabelDanger: {
    color: '#E84545',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EDF8',
    marginHorizontal: 20,
  },

  // Logout
  logoutContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
  logoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});