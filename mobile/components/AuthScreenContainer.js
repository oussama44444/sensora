import React from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreenContainer = ({ children }) => {
  return (
    <LinearGradient
      colors={['#DDA0DD', '#FFB6D9', '#87CEEB']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative Stars */}
      <View style={[styles.decorStar, { top: 30, left: 20 }]}>
        <Text style={styles.decorEmoji}>⭐</Text>
      </View>
      <View style={[styles.decorStar, { top: 100, right: 30 }]}>
        <Text style={styles.decorEmoji}>❤️</Text>
      </View>
      <View style={[styles.decorStar, { bottom: 150, left: 30 }]}>
        <Text style={styles.decorEmoji}>🎨</Text>
      </View>
      <View style={[styles.decorStar, { bottom: 80, right: 40 }]}>
        <Text style={styles.decorEmoji}>😊</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  decorStar: {
    position: 'absolute',
    zIndex: 1,
  },
  decorEmoji: {
    fontSize: 32,
    opacity: 0.7,
  },
});

export default AuthScreenContainer;
