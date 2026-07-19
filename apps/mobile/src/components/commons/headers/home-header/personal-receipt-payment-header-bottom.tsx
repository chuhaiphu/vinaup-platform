import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';

const PersonalReceiptPaymentHeaderBottom = () => {
  const router = useRouter();

  const handleAddNew = () => {
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: 'new',
        receiptPaymentType: 'PAYMENT',
      },
    });
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleLeft}>Thu chi</Text>
        <Text style={styles.titleRight}> ngày</Text>
      </View>
      <Button onPress={handleAddNew}>
        <VinaupAddNew width={30} height={30} />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLeft: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  titleRight: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default PersonalReceiptPaymentHeaderBottom;
