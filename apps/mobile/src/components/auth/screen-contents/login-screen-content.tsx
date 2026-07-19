import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { localSignInSchema } from '@vinaup-platform/validation';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button } from '@/components/primitives/button';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useValidatedFields, type FieldErrors } from '@/hooks/use-validated-fields';
import { useAuthContext } from '@/providers/auth/auth-provider';

export function LoginScreenContent() {
  const { isLoading, performLogin } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const { fieldValues, fieldErrors, setFieldValue, validateAll } = useValidatedFields(
    { email: '', password: '' },
    (input) => {
      const result = localSignInSchema.safeParse(input);
      if (result.success) return { success: true, data: result.data };
      const nextFieldErrors: FieldErrors<'email' | 'password'> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !nextFieldErrors[field]) nextFieldErrors[field] = issue.message;
      }
      return { success: false, fieldErrors: nextFieldErrors };
    },
  );

  const handleLogin = async () => {
    const data = validateAll();
    if (!data) return;

    const isSuccess = await performLogin(data);
    if (isSuccess) {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.formRoot}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Image source={{ uri: 'vinaup_logo_secondary' }} style={styles.formLogo} />
            <Text style={styles.formTitle}>Đăng nhập</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nhập email"
              style={[styles.input, !!fieldErrors.email && styles.inputError]}
              value={fieldValues.email}
              onChangeText={(value) => setFieldValue('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.gray400}
            />
            {!!fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

            <View style={styles.passwordInput}>
              <TextInput
                placeholder="Nhập mật khẩu"
                style={[styles.input, !!fieldErrors.password && styles.inputError]}
                value={fieldValues.password}
                onChangeText={(value) => setFieldValue('password', value)}
                secureTextEntry={!showPassword}
                placeholderTextColor={COLORS.gray400}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={ICON_SIZES.md}
                  color={COLORS.gray400}
                />
              </Pressable>
            </View>
            {!!fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}
          </View>

          <Button
            isLoading={isLoading}
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Button>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
            <FontAwesome6
              iconStyle="solid"
              name="arrow-right-long"
              size={ICON_SIZES.xs}
              color={COLORS.white}
            />
            <Text style={styles.footerLink} onPress={() => router.replace('/register')}>
              Đăng ký
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formRoot: {
    flex: 1,
    backgroundColor: COLORS.teal900,
  },
  formContainer: {
    padding: SPACING.xl,
    flex: 1,
    justifyContent: 'center',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  formTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES['2xl'],
    marginTop: SPACING.xl,
  },
  formLogo: {
    width: 80,
    height: 80,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  passwordInput: {
    position: 'relative',
  },
  input: {
    color: COLORS.white,
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.yellow400,
  },
  inputError: {
    borderColor: COLORS.red400,
  },
  errorText: {
    color: COLORS.red300,
    fontSize: FONT_SIZES.sm,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '25%',
  },
  button: {
    backgroundColor: COLORS.yellow400,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.teal900,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  footerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  footerLink: {
    color: COLORS.yellow400,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
