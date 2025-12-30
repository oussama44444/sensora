import React, { useEffect, useState, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthScreenContainer from '../components/AuthScreenContainer';
import RegisterForm from '../components/RegisterForm';
import SuccessNotification from '../components/SuccessNotification';
import ErrorNotification from '../components/ErrorNotification';

const RegisterScreen = ({ navigation }) => {
  const { register, loading, error, clearError, completeLogin } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingUserRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Login');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleRegister = async (userData) => {
    const result = await register(userData, true); // true = delay navigation

    if (result.success) {
      pendingUserRef.current = result.user;
      setShowSuccess(true);
    } else {
      setErrorMessage(result.error);
      setShowError(true);
    }
  };

  const handleValidationError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleSuccessHide = () => {
    setShowSuccess(false);
    if (pendingUserRef.current) {
      completeLogin(pendingUserRef.current);
    }
  };

  return (
    <AuthScreenContainer>
      <RegisterForm
        onSubmit={handleRegister}
        loading={loading}
        error={error}
        clearError={clearError}
        navigation={navigation}
        onValidationError={handleValidationError}
      />
      <SuccessNotification 
        visible={showSuccess}
        message="Super ! Ton compte est créé ! 🎉"
        onHide={handleSuccessHide}
      />
      <ErrorNotification 
        visible={showError}
        message={errorMessage}
        onHide={() => setShowError(false)}
      />
    </AuthScreenContainer>
  );
};

export default RegisterScreen;
