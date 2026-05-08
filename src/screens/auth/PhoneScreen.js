import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { validateEmail } from '../../utils/validators';
import { publicApi } from '../../utils/api';

export default function PhoneScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  
//   const handleContinue = async () => {
//   const validationError = validateEmail(email);
//   if (validationError) {
//     setError(validationError);
//     shake();
//     return;
//   }

//   setError('');
//   setLoading(true);

//   try {
//     const res = await publicApi.sendEmailOTP(email.trim().toLowerCase());

//     console.log('res', res);

//     if (res?.status === 1) {
//       // ✅ stop loader BEFORE navigating
//       setLoading(false);
//       navigation.navigate('OTP', { email: email.trim().toLowerCase() });
//     } else {
//       setError(res?.msg || 'Failed to send OTP. Try again.');
//       shake();
//       setLoading(false);
//     }
//   } catch (err) {
//     setError(err?.message || err?.msg || 'Failed to send OTP. Try again.');
//     shake();
//     setLoading(false);
//   }
// };

  
  const handleContinue = async () => {
  const validationError = validateEmail(email);

  if (validationError) {
    setError(validationError);
    shake();
    return;
  }

  try {
    setLoading(true);
    setError('');

    const res = await publicApi.sendEmailOTP(
      email.trim().toLowerCase()
    );

    console.log('OTP RESPONSE:', res);

    if (res?.status === 1) {
      navigation.navigate('OTP', {
        email: email.trim().toLowerCase(),
      });
    } else {
      setError(res?.msg || 'Failed to send OTP');
      shake();
    }
  } catch (err) {
    console.log(err);

    setError(err?.message || 'Something went wrong');
    shake();
  } finally {
    // ✅ always stop loader
    setLoading(false);
  }
};

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
        <Text style={styles.title}>Enter your email</Text>
        <Text style={styles.sub}>
          We'll send a 4-digit verification code to confirm your email address.
        </Text>

        {/* Input */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <View style={[
            styles.inputWrapper,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={error ? colors.error : isFocused ? colors.primary : colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={handleContinue}
              returnKeyType="done"
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => { setEmail(''); setError(''); }}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.btnGradient}>
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
    flex: 1,
    backgroundColor: '#F8F5FF',
    padding: 24,
    paddingTop: 60,
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
    marginBottom: 36, lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16, height: 56,
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12,
    elevation: 3,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.15,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15,
    color: colors.textPrimary,
  },
  errorRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, marginTop: 8, marginLeft: 4,
  },
  errorText: {
    fontSize: 13, color: colors.error,
  },
  btn: {
    borderRadius: 50, overflow: 'hidden',
    marginTop: 32,
  },
  btnGradient: {
    height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: {
    color: '#fff', fontWeight: '700', fontSize: 16,
  },
});