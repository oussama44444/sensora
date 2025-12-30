import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SuccessNotification = ({ message, visible, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  
  const confetti1 = useRef(new Animated.Value(0)).current;
  const confetti2 = useRef(new Animated.Value(0)).current;
  const confetti3 = useRef(new Animated.Value(0)).current;
  const confetti4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
      scaleAnim.setValue(0.3);
      
      // Main notification animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animations
      const animateConfetti = (animValue, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateConfetti(confetti1, 0);
      animateConfetti(confetti2, 200);
      animateConfetti(confetti3, 400);
      animateConfetti(confetti4, 600);

      // Auto hide after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide?.();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const { width } = Dimensions.get('window');

  const confettiStyle1 = {
    opacity: confetti1,
    transform: [
      { translateY: confetti1.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) },
      { translateX: confetti1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
      { rotate: confetti1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
    ],
  };

  const confettiStyle2 = {
    opacity: confetti2,
    transform: [
      { translateY: confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }) },
      { translateX: confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
      { rotate: confetti2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) },
    ],
  };

  const confettiStyle3 = {
    opacity: confetti3,
    transform: [
      { translateY: confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }) },
      { translateX: confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
      { rotate: confetti3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
    ],
  };

  const confettiStyle4 = {
    opacity: confetti4,
    transform: [
      { translateY: confetti4.interpolate({ inputRange: [0, 1], outputRange: [0, 140] }) },
      { translateX: confetti4.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) },
      { rotate: confetti4.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] }) },
    ],
  };

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View
        style={[
          styles.notificationWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#A855F7', '#EC4899', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Animated.Text style={[styles.confetti, confettiStyle1, { top: 10, left: 20 }]}>
              🎉
            </Animated.Text>
            <Animated.Text style={[styles.confetti, confettiStyle2, { top: 15, right: 25 }]}>
              ⭐
            </Animated.Text>
            <Animated.Text style={[styles.confetti, confettiStyle3, { top: 20, left: 60 }]}>
              ✨
            </Animated.Text>
            <Animated.Text style={[styles.confetti, confettiStyle4, { top: 12, right: 55 }]}>
              🎊
            </Animated.Text>

            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎉</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.decorativeRow}>
              <Text style={styles.decorativeEmoji}>⭐</Text>
              <Text style={styles.decorativeEmoji}>✨</Text>
              <Text style={styles.decorativeEmoji}>🌟</Text>
              <Text style={styles.decorativeEmoji}>💫</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  notificationWrapper: {
    width: '70%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  gradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  icon: {
    fontSize: 28,
  },
  message: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  decorativeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  decorativeEmoji: {
    fontSize: 18,
  },
});

export default SuccessNotification;
