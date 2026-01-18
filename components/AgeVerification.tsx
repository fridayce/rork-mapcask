import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface AgeVerificationProps {
  onVerified: () => void;
}

export default function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [rememberMe, setRememberMe] = useState(false);

  const handleYes = () => {
    console.log('Age verified, remember me:', rememberMe);
    onVerified();
  };

  const handleNo = () => {
    console.log('User is under 21');
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hwd4vk9l5op9ap0pvzqa5' }}
          style={styles.logo}
          contentFit="contain"
        />
        
        <Text style={styles.question}>Are you over 21?</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleYes}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>YES</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNo}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>NO</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <View style={styles.checkmark} />}
          </View>
          <Text style={styles.checkboxLabel}>Remember me for future visits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: width * 0.88,
    maxWidth: 400,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 32,
  },
  question: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
  },
  checkboxLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
  },
});
