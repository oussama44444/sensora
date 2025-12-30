import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import ProfileContent from '../components/ProfileContent';
import SuccessNotification from '../components/SuccessNotification';

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = () => {
    setShowLogoutSuccess(true);
  };

  const handleLogoutComplete = () => {
    setShowLogoutSuccess(false);
    logout();
  };

  return (
    <LinearGradient
      colors={['#E0F2FE', '#F3E8FF', '#FCE7F3']}
      style={styles.container}
    >
      <ProfileContent onLogout={handleLogout} />
      <SuccessNotification
        visible={showLogoutSuccess}
        message="À bientôt ! 👋🌈"
        onHide={handleLogoutComplete}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfileScreen;
