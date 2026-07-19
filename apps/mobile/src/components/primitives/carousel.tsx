import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { FONT_SIZES, FONT_WEIGHTS } from '@/constants/style-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  { id: '1', label: 'Slide 1', color: '#FF6B6B' },
  { id: '2', label: 'Slide 2', color: '#4ECDC4' },
  { id: '3', label: 'Slide 3', color: '#45B7D1' },
];

export default function Carousel() {
  const translateX = useSharedValue(0);
  return (
    // Viewable area - only shows one slide at a time
    // Hide the others with overflow: 'hidden'
    <View style={styles.viewport}>
      {/* TRACK: contains all slides */}
      <Animated.View style={styles.track}>
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { backgroundColor: slide.color }]}>
            <Text style={styles.label}>{slide.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: SCREEN_WIDTH,
    height: 200,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: 'white',
  },
});
