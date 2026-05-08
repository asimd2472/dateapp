import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

export default function SignUpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💕</Text>
      <Text style={styles.appName}>Match Mingle</Text>
      <Text style={styles.title}>Sign-up to continue</Text>
      <Text style={styles.sub}>Find your perfect match today</Text>

      <TouchableOpacity style={styles.emailBtn} onPress={() => navigation.navigate('Phone')}>
        <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.emailBtnGradient}>
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.emailBtnText}>Continue with email</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.phoneBtn} onPress={() => navigation.navigate('Phone')}>
        <Ionicons name="call-outline" size={20} color={colors.primary} />
        <Text style={styles.phoneBtnText}>Use phone number</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or Sign-up with</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialRow}>
        {['logo-facebook', 'logo-google', 'logo-apple'].map((icon, i) => (
          <TouchableOpacity key={i} style={styles.socialBtn}>
            <Ionicons name={icon} size={24} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.terms}>
        I accept all the{' '}
        <Text style={styles.link}>Terms & Conditions</Text>
        {' '}&{' '}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { fontSize: 48, marginBottom: 8 },
  appName: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.textMuted, marginBottom: 40 },
  emailBtn: { width: '100%', borderRadius: 50, overflow: 'hidden', marginBottom: 16 },
  emailBtnGradient: { flexDirection: 'row', height: 54, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emailBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  phoneBtn: { width: '100%', height: 54, borderRadius: 50, borderWidth: 1.5, borderColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 32 },
  phoneBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.textMuted, fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 20, marginBottom: 40 },
  socialBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  terms: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  link: { color: colors.primary, fontWeight: '600' },
});