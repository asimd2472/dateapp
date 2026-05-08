import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function GenderScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title}>Select your gender</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Interests')}>
        <LinearGradient colors={['#6C3FC5', '#9B6EE8']} style={styles.btnGradient}>
          <Text style={styles.btnText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5FF', padding: 24, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 40 },
  btn: { borderRadius: 50, overflow: 'hidden', marginTop: 'auto' },
  btnGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});