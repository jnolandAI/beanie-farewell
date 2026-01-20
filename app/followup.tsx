import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import {
  FollowUpQuestion,
  ConditionLevel,
  PelletType,
  FollowUpAnswers,
} from '../types/beanie';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Memphis Pattern SVG overlay - Bold 90s style (different arrangement than other screens)
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* === FILLED SHAPES WITH BLACK OUTLINES === */}

      {/* Magenta circle with black outline - TOP LEFT */}
      <Circle
        cx="40"
        cy="80"
        r="20"
        fill="#FF00FF"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal triangle with black outline - TOP RIGHT */}
      <Polygon
        points="340,50 370,100 310,100"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Yellow circle with black outline - LEFT SIDE */}
      <Circle
        cx="55"
        cy="300"
        r="14"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Orange triangle with black outline - RIGHT MID */}
      <Polygon
        points="365,420 390,470 340,470"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple circle with black outline - BOTTOM LEFT */}
      <Circle
        cx="70"
        cy="680"
        r="18"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BLACK OUTLINE ONLY SHAPES === */}

      {/* Black outline triangle - MID LEFT */}
      <Polygon
        points="25,450 55,500 -5,500"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline circle - RIGHT */}
      <Circle
        cx="355"
        cy="250"
        r="12"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline diamond - BOTTOM RIGHT */}
      <Polygon
        points="340,720 360,740 340,760 320,740"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BOLD SQUIGGLES === */}

      {/* Teal squiggle - TOP */}
      <Path
        d="M140 60 Q165 30, 190 60 Q215 90, 240 60"
        stroke="#00CED1"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Black squiggle - MID RIGHT */}
      <Path
        d="M320 560 Q345 530, 370 560"
        stroke="#000000"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* === ZIGZAG === */}
      <Path
        d="M30 550 L45 525 L60 550 L75 525 L90 550"
        stroke="#FF00FF"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === SMALL ACCENTS === */}

      {/* Teal filled circle - small pop */}
      <Circle cx="90" cy="180" r="8" fill="#00CED1" />

      {/* Orange circle - bottom */}
      <Circle cx="120" cy="750" r="10" fill="#FF6B35" />

      {/* Black dots cluster */}
      <Circle cx="335" cy="160" r="4" fill="#000000" />
      <Circle cx="350" cy="170" r="4" fill="#000000" />
      <Circle cx="325" cy="175" r="4" fill="#000000" />
    </Svg>
  );
}

// Condition options with descriptions
const CONDITION_OPTIONS: { value: ConditionLevel; label: string; description: string }[] = [
  { value: 'mint_with_tag', label: 'Mint with Tag', description: 'Perfect condition, original tag attached' },
  { value: 'mint_no_tag', label: 'Mint, No Tag', description: 'Perfect condition, tag removed or missing' },
  { value: 'excellent', label: 'Excellent', description: 'Minor wear, very clean' },
  { value: 'good', label: 'Good', description: 'Some wear, light stains or fading' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear, needs cleaning' },
];

// Pellet type options
const PELLET_OPTIONS: { value: PelletType; label: string; description: string }[] = [
  { value: 'pvc', label: 'PVC Pellets', description: 'Tiny hard beans that feel like small pebbles' },
  { value: 'pe', label: 'PE Pellets', description: 'Soft foam balls that compress easily' },
  { value: 'unknown', label: 'Not Sure', description: 'Cannot determine pellet type' },
];

export default function FollowUpScreen() {
  const params = useLocalSearchParams<{
    name: string;
    animal_type: string;
    variant: string;
    colors: string;
    estimated_value_low: string;
    estimated_value_high: string;
    value_notes: string;
    confidence: string;
    has_visible_hang_tag: string;
    follow_up_questions: string;
    potential_value_if_rare: string;
    roast?: string;
  }>();

  // Parse incoming data
  const followUpQuestions: FollowUpQuestion[] = params.follow_up_questions
    ? JSON.parse(params.follow_up_questions)
    : [];
  const potentialValue = params.potential_value_if_rare
    ? JSON.parse(params.potential_value_if_rare)
    : null;

  // State for answers
  const [condition, setCondition] = useState<ConditionLevel | null>(null);
  const [pelletType, setPelletType] = useState<PelletType | null>(null);
  const [originalPackaging, setOriginalPackaging] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Check if form is valid (all required questions answered)
  const isFormValid = () => {
    for (const question of followUpQuestions) {
      if (question.type === 'condition' && !condition) return false;
      if (question.type === 'pellet_type' && !pelletType) return false;
      if (question.type === 'original_packaging' && originalPackaging === null) return false;
      // Photo questions are optional but recommended
    }
    return true;
  };

  // Take a photo for a specific question
  const takePhotoFor = async (questionType: string, prompt: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      // Could show error, but keep it simple
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos((prev) => ({
        ...prev,
        [questionType]: result.assets[0].base64!,
      }));
    }
  };

  // Choose from library for a specific question
  const chooseFromLibraryFor = async (questionType: string) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos((prev) => ({
        ...prev,
        [questionType]: result.assets[0].base64!,
      }));
    }
  };

  // Submit and navigate to results
  const handleSubmit = () => {
    const answers: FollowUpAnswers = {};
    if (condition) answers.condition = condition;
    if (pelletType) answers.pellet_type = pelletType;
    if (originalPackaging !== null) answers.original_packaging = originalPackaging;

    router.push({
      pathname: '/result',
      params: {
        name: params.name,
        animal_type: params.animal_type,
        variant: params.variant,
        colors: params.colors,
        estimated_value_low: params.estimated_value_low,
        estimated_value_high: params.estimated_value_high,
        value_notes: params.value_notes,
        confidence: params.confidence,
        has_visible_hang_tag: params.has_visible_hang_tag,
        followUpAnswers: JSON.stringify(answers),
        followUpPhotos: JSON.stringify(photos),
        roast: params.roast || undefined,
      },
    });
  };

  // Render a photo question
  const renderPhotoQuestion = (question: FollowUpQuestion) => {
    const hasPhoto = !!photos[question.type];

    return (
      <BlurView key={question.type} intensity={40} tint="light" style={styles.questionCard}>
        <View style={styles.questionCardInner}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionIcon}>📸</Text>
            <View style={styles.questionTextContainer}>
              <Text style={styles.questionText}>{question.photoPrompt}</Text>
              <Text style={styles.questionReason}>{question.reason}</Text>
            </View>
          </View>

          {hasPhoto ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${photos[question.type]}` }}
                style={styles.photoPreview}
              />
              <Pressable
                style={styles.retakeButton}
                onPress={() => takePhotoFor(question.type, question.photoPrompt || '')}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.photoButton,
                  pressed && styles.photoButtonPressed,
                ]}
                onPress={() => takePhotoFor(question.type, question.photoPrompt || '')}
              >
                <LinearGradient
                  colors={['#00CED1', '#00B4D8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.photoButtonGradient}
                >
                  <Text style={styles.photoButtonIcon}>📷</Text>
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.photoButtonSecondary,
                  pressed && styles.photoButtonSecondaryPressed,
                ]}
                onPress={() => chooseFromLibraryFor(question.type)}
              >
                <Text style={styles.photoButtonSecondaryText}>Library</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.valueImpactBadge}>
            <Text style={styles.valueImpactText}>{question.valueImpact}</Text>
          </View>
        </View>
      </BlurView>
    );
  };

  // Render condition selector
  const renderConditionQuestion = (question: FollowUpQuestion) => (
    <BlurView key={question.type} intensity={40} tint="light" style={styles.questionCard}>
      <View style={styles.questionCardInner}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionIcon}>✨</Text>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.questionReason}>{question.reason}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {CONDITION_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.optionButton,
                condition === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => setCondition(option.value)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionRadio,
                  condition === option.value && styles.optionRadioSelected,
                ]}>
                  {condition === option.value && <View style={styles.optionRadioInner} />}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      condition === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.valueImpactBadge}>
          <Text style={styles.valueImpactText}>{question.valueImpact}</Text>
        </View>
      </View>
    </BlurView>
  );

  // Render pellet type selector
  const renderPelletQuestion = (question: FollowUpQuestion) => (
    <BlurView key={question.type} intensity={40} tint="light" style={styles.questionCard}>
      <View style={styles.questionCardInner}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionIcon}>🫘</Text>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.questionReason}>{question.reason}</Text>
          </View>
        </View>

        <View style={styles.pelletInstructions}>
          <Text style={styles.pelletInstructionsText}>
            Squeeze gently to feel the filling
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {PELLET_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.optionButton,
                pelletType === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => setPelletType(option.value)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionRadio,
                  pelletType === option.value && styles.optionRadioSelected,
                ]}>
                  {pelletType === option.value && <View style={styles.optionRadioInner} />}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      pelletType === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.valueImpactBadge}>
          <Text style={styles.valueImpactText}>{question.valueImpact}</Text>
        </View>
      </View>
    </BlurView>
  );

  // Render original packaging question
  const renderPackagingQuestion = (question: FollowUpQuestion) => (
    <BlurView key={question.type} intensity={40} tint="light" style={styles.questionCard}>
      <View style={styles.questionCardInner}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionIcon}>📦</Text>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.questionReason}>{question.reason}</Text>
          </View>
        </View>

        <View style={styles.binaryOptionsRow}>
          <Pressable
            style={[
              styles.binaryOption,
              originalPackaging === true && styles.binaryOptionSelected,
            ]}
            onPress={() => setOriginalPackaging(true)}
          >
            <Text
              style={[
                styles.binaryOptionText,
                originalPackaging === true && styles.binaryOptionTextSelected,
              ]}
            >
              Yes
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.binaryOption,
              originalPackaging === false && styles.binaryOptionSelected,
            ]}
            onPress={() => setOriginalPackaging(false)}
          >
            <Text
              style={[
                styles.binaryOptionText,
                originalPackaging === false && styles.binaryOptionTextSelected,
              ]}
            >
              No
            </Text>
          </Pressable>
        </View>

        <View style={styles.valueImpactBadge}>
          <Text style={styles.valueImpactText}>{question.valueImpact}</Text>
        </View>
      </View>
    </BlurView>
  );

  // Render the appropriate question type
  const renderQuestion = (question: FollowUpQuestion) => {
    switch (question.type) {
      case 'condition':
        return renderConditionQuestion(question);
      case 'pellet_type':
        return renderPelletQuestion(question);
      case 'original_packaging':
        return renderPackagingQuestion(question);
      case 'tush_tag_photo':
      case 'hang_tag_photo':
      case 'color_confirmation':
        return renderPhotoQuestion(question);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - pure white/light gray */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay at 50% opacity */}
      <MemphisPattern />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Back button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          {/* Header section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerIcon}>🔍</Text>
            <Text style={styles.title}>Let's Get Specific</Text>
            <Text style={styles.subtitle}>
              {params.name} could be worth more. Help us give you an accurate estimate.
            </Text>
          </View>

          {/* Potential value teaser */}
          {potentialValue && (
            <BlurView intensity={40} tint="light" style={styles.potentialValueCard}>
              <View style={styles.potentialValueContent}>
                <Text style={styles.potentialValueLabel}>POTENTIAL VALUE IF RARE</Text>
                <View style={styles.potentialValueRow}>
                  <Text style={styles.potentialValueAmount}>
                    ${potentialValue.low}
                  </Text>
                  <Text style={styles.potentialValueDash}>-</Text>
                  <Text style={styles.potentialValueAmount}>
                    ${potentialValue.high}
                  </Text>
                </View>
                <Text style={styles.potentialValueConditions}>
                  {potentialValue.conditions}
                </Text>
              </View>
            </BlurView>
          )}

          {/* Questions */}
          <View style={styles.questionsSection}>
            {followUpQuestions.map((question) => renderQuestion(question))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed footer with submit button */}
      <View style={styles.footer}>
        <BlurView intensity={60} tint="light" style={styles.footerBlur}>
          <View style={styles.footerContent}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!isFormValid()}
              >
                <LinearGradient
                  colors={
                    isFormValid()
                      ? ['#FF00FF', '#FF1493']
                      : ['#CCCCCC', '#BBBBBB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.submitButton,
                    !isFormValid() && styles.submitButtonDisabled,
                  ]}
                >
                  <Text style={styles.submitButtonText}>Get My Valuation</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
            {!isFormValid() && (
              <Text style={styles.footerHint}>Answer the required questions above</Text>
            )}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  memphisPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 140,
  },
  backButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#00CED1',
    fontSize: 17,
    fontWeight: '600',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  potentialValueCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  potentialValueContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  potentialValueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CED1',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  potentialValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  potentialValueAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00CED1',
  },
  potentialValueDash: {
    fontSize: 24,
    color: '#999999',
  },
  potentialValueConditions: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  questionsSection: {
    gap: 16,
  },
  questionCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  questionCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  questionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  questionReason: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderColor: '#00CED1',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: '#00CED1',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00CED1',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#00CED1',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666666',
  },
  pelletInstructions: {
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pelletInstructionsText: {
    fontSize: 14,
    color: '#00CED1',
    textAlign: 'center',
    fontWeight: '600',
  },
  binaryOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  binaryOption: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  binaryOptionSelected: {
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderColor: '#00CED1',
  },
  binaryOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  binaryOptionTextSelected: {
    color: '#00CED1',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  photoButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  photoButtonIcon: {
    fontSize: 18,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  photoButtonSecondary: {
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  photoButtonSecondaryPressed: {
    backgroundColor: '#FFFFFF',
  },
  photoButtonSecondaryText: {
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  retakeButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  valueImpactBadge: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  valueImpactText: {
    fontSize: 13,
    color: '#00CED1',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  footerBlur: {
    overflow: 'hidden',
  },
  footerContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
  },
  submitButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerHint: {
    color: '#999999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
