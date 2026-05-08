import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { publicApi } from '../../utils/api';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OTPScreen({ navigation, route }) {
  const { email } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Countdown timer ──────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Shake animation ──────────────────────────────────────────
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── OTP input handlers ───────────────────────────────────────
  const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (error) setError('');
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the complete 4-digit code');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await publicApi.verifyOTP(email, code);

      // Check status field from API response
      if (response?.status === 1 && response?.token) {
        // Success — store token and user details
        await AsyncStorage.setItem('token', response.token);
        if (response?.user_details) {
          await AsyncStorage.setItem('user_details', JSON.stringify(response.user_details));
        }
        // Navigate to ProfileSetup
        navigation.navigate('ProfileSetup', { email, token: response.token });
      } else {
        // API returned status 0 or no token
        const errMsg = response?.msg || 'Invalid OTP. Please try again.';
        setError(errMsg);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
        shake();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      shake();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setError('');
    try {
      await publicApi.sendEmailOTP(email);
      setOtp(['', '', '', '']);
      setCountdown(RESEND_SECONDS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>
          We sent a 4-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* Timer */}
        <Text style={[styles.timer, countdown <= 10 && styles.timerWarning]}>
          {formatTime(countdown)}
        </Text>

        {/* OTP Boxes */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit && styles.otpBoxFilled,
                error && styles.otpBoxError,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          {resendLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text style={[styles.resendBtn, !canResend && styles.resendDisabled]}>
                Resend
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.btn, (!isComplete || loading) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isComplete ? ['#6C3FC5', '#9B6EE8'] : ['#C4B8E8', '#C4B8E8']}
            style={styles.btnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F8F5FF',
    padding: 24, paddingTop: 60,
  },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE8FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26, fontWeight: '800',
    color: colors.textPrimary, marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: colors.textMuted,
    lineHeight: 22, marginBottom: 24,
  },
  emailHighlight: {
    color: colors.primary, fontWeight: '700',
  },
  timer: {
    fontSize: 36, fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center', marginBottom: 32,
  },
  timerWarning: { color: colors.error },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, marginBottom: 16,
  },
  otpBox: {
    width: 64, height: 64, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: '#fff',
    textAlign: 'center', fontSize: 24,
    fontWeight: '800', color: colors.textPrimary,
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#EDE8FF',
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  errorRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4, marginBottom: 8,
  },
  errorText: { fontSize: 13, color: colors.error },
  resendRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginTop: 16, marginBottom: 32,
  },
  resendLabel: { fontSize: 14, color: colors.textMuted },
  resendBtn: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  resendDisabled: { color: colors.textMuted },
  btn: { borderRadius: 50, overflow: 'hidden', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnGradient: {
    height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});