import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Mail, Check } from 'lucide-react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AgeVerification from '@/components/AgeVerification';
import AnimatedSplash from '@/components/AnimatedSplash';
import { useApp } from '@/contexts/app-context';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, isSigningIn } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadRememberMePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('rememberMe');
        if (saved === 'true') {
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error loading remember me preference:', error);
      }
    };
    loadRememberMePreference();
  }, []);

  const toggleRememberMe = async () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    try {
      await AsyncStorage.setItem('rememberMe', newValue.toString());
      console.log('Remember me preference saved:', newValue);
    } catch (error) {
      console.log('Error saving remember me preference:', error);
    }
  };

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    console.log('Login screen mounted');
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        const fetchUserInfo = async (accessToken: string) => {
          try {
            console.log('Fetching user info with access token');
            const userInfoResponse = await fetch(
              'https://www.googleapis.com/userinfo/v2/me',
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const userInfo = await userInfoResponse.json();
            console.log('Google user info:', userInfo);

            signInWithGoogle({
              name: userInfo.name || 'User',
              email: userInfo.email,
              avatar: userInfo.picture,
              googleId: userInfo.id,
            });

            router.replace('/get-started');
          } catch (error) {
            console.error('Error fetching user info:', error);
            Alert.alert('Sign In Failed', 'Could not retrieve user information.');
          } finally {
            setIsLoading(false);
          }
        };
        fetchUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.log('Google auth error:', response.error);
      Alert.alert('Sign In Failed', 'Could not sign in with Google. Please try again.');
      setIsLoading(false);
    }
  }, [response, signInWithGoogle, router]);

  if (showSplash) {
    return <AnimatedSplash onFinish={() => {
      setShowSplash(false);
      setShowAgeVerification(true);
    }} />;
  }

  if (showAgeVerification) {
    return <AgeVerification onVerified={() => {
      setShowAgeVerification(false);
      setShowLogin(true);
    }} />;
  }

  if (!showLogin) {
    return null;
  }

  const handleAppleSignIn = () => {
    console.log('Apple Sign In pressed');
    router.replace('/get-started');
  };

  const handleGoogleSignIn = async () => {
    console.log('Google Sign In pressed');
    if (!GOOGLE_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID) {
      Alert.alert(
        'Configuration Required',
        'Google Sign-In is not configured. Please add Google OAuth credentials.',
        [{ text: 'Continue as Guest', onPress: () => router.replace('/get-started') }]
      );
      return;
    }
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error prompting Google auth:', error);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    console.log('Email Sign In pressed');
    router.replace('/get-started');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hwd4vk9l5op9ap0pvzqa5' }}
              style={styles.logo}
              contentFit="contain"
            />
            
            <Text style={styles.headline}>
              Discover Bourbon,{'\n'}Create Maps &{'\n'}Share Finds
            </Text>
            
            <Text style={styles.subheadline}>
              Sign up to start your bourbon hunting journey.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              activeOpacity={0.7}
            >
              <View style={styles.socialButtonContent}>
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.socialButtonText}>Sign up with Apple</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, (isLoading || isSigningIn) && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.7}
              disabled={isLoading || isSigningIn}
            >
              <View style={styles.socialButtonContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 10 }} />
                ) : (
                  <Image
                    source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                    style={styles.googleIcon}
                    contentFit="contain"
                  />
                )}
                <Text style={styles.socialButtonText}>
                  {isLoading ? 'Signing in...' : 'Sign up with Google'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailSignIn}
              activeOpacity={0.8}
            >
              <Mail size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.emailButtonText}>Sign up with email</Text>
            </TouchableOpacity>

            <Pressable 
              style={styles.rememberMeContainer} 
              onPress={toggleRememberMe}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.rememberMeText}>Keep me signed in</Text>
            </Pressable>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?  </Text>
              <TouchableOpacity onPress={() => router.replace('/get-started')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={() => router.replace('/get-started')}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 28,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    paddingVertical: 10,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  appleIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#000000',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1A1A1A',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#AAAAAA',
    fontSize: 14,
  },
  emailButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    alignSelf: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500' as const,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    fontSize: 15,
    color: '#666666',
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 16,
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingVertical: 15,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#666666',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
