import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Mail } from 'lucide-react-native';
import AgeVerification from '@/components/AgeVerification';
import AnimatedSplash from '@/components/AnimatedSplash';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    console.log('Login screen mounted');
  }, []);

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

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    router.replace('/get-started');
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
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.7}
            >
              <View style={styles.socialButtonContent}>
                <Image
                  source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                  style={styles.googleIcon}
                  contentFit="contain"
                />
                <Text style={styles.socialButtonText}>Sign up with Google</Text>
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
});
