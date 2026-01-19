import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      console.log('Location permission status:', status);
      
      if (status === 'granted') {
        router.replace('/(tabs)');
      } else {
        if (Platform.OS === 'web') {
          alert('Location permission is required to use this app. Please enable location access in your browser settings.');
        }
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      router.replace('/(tabs)');
    } finally {
      setIsRequesting(false);
    }
  };

  const skipForNow = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MapPin size={64} color="#4A90E2" strokeWidth={2} />
            </View>
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>Enable Location Services</Text>
            <Text style={styles.description}>
              Mapcast uses your location to help you discover bourbon bars, distilleries, and ABC stores near you.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <Navigation size={20} color="#4A90E2" />
                </View>
                <Text style={styles.featureText}>
                  Find nearby bourbon locations
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <MapPin size={20} color="#4A90E2" />
                </View>
                <Text style={styles.featureText}>
                  Track your bourbon hunting journey
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <MapPin size={20} color="#4A90E2" />
                </View>
                <Text style={styles.featureText}>
                  Share finds with your location
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={requestLocationPermission}
              disabled={isRequesting}
              activeOpacity={0.8}
            >
              <Text style={styles.enableButtonText}>
                {isRequesting ? 'Requesting...' : 'Enable Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipForNow}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featuresList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  featureBullet: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  enableButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#666666',
  },
});
