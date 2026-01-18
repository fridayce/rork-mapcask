import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map, Users, Award, Compass } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function GetStartedScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Map,
      title: 'Discover Locations',
      description: 'Find bourbon bars, distilleries, and ABC stores near you',
    },
    {
      icon: Compass,
      title: 'Track Your Journey',
      description: 'Log your bourbon finds and build your collection',
    },
    {
      icon: Users,
      title: 'Connect with Friends',
      description: 'Share your discoveries with fellow bourbon enthusiasts',
    },
    {
      icon: Award,
      title: 'Earn Achievements',
      description: 'Complete challenges and showcase your expertise',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a1810', '#1a1a1a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hwd4vk9l5op9ap0pvzqa5' }}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.welcomeText}>Welcome to Mapcast</Text>
            <Text style={styles.subtitle}>
              Your personal guide to discovering and tracking exceptional bourbons
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.iconContainer}>
                    <Icon size={28} color="#D4A574" strokeWidth={2} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#D4A574', '#B8935E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Join thousands of bourbon lovers on their journey
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 48,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  getStartedButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
