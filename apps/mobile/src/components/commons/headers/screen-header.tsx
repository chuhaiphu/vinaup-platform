import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import VinaupSaveAndExit from '@/components/icons/vinaup-save-and-exit.native';
import { Button } from '@/components/primitives/button';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  COLORS,
  FONT_SIZES,
  HEADER_HEIGHT,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';

export interface ScreenHeaderStyles {
  container?: StyleProp<ViewStyle>;
  headerBar?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  leftContainer?: StyleProp<ViewStyle>;
  rightContainer?: StyleProp<ViewStyle>;
  extensionContainer?: StyleProp<ViewStyle>;
}

export interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  backIcon?: React.ReactNode;
  hideBack?: boolean;
  onSave?: () => void;
  saveIcon?: React.ReactNode;
  isSaving?: boolean;
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
  isDeleting?: boolean;
  onAdd?: () => void;
  addIcon?: React.ReactNode;
  isAdding?: boolean;
  extension?: React.ReactNode;
  styles?: ScreenHeaderStyles;
}

export function ScreenHeader({
  title,
  onBackPress,
  backIcon,
  hideBack = false,
  onSave,
  saveIcon,
  isSaving,
  onDelete,
  deleteIcon,
  isDeleting,
  onAdd,
  addIcon,
  isAdding,
  extension,
  styles: customStyles,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  const defaultBackIcon = (
    <Ionicons name="chevron-back" size={ICON_SIZES.lg} color={COLORS.teal700} />
  );
  const defaultDeleteIcon = (
    <FontAwesome name="trash-o" size={ICON_SIZES.md} color={COLORS.teal700} />
  );
  const defaultSaveIcon = <VinaupSaveAndExit width={32} height={24} color={COLORS.teal700} />;
  const defaultAddIcon = <VinaupAddNew width={28} height={28} />;

  return (
    <View style={[{ paddingTop: insets.top }, defaultStyles.container, customStyles?.container]}>
      <View style={[defaultStyles.headerBar, customStyles?.headerBar]}>
        <View
          style={[defaultStyles.innerContainer, defaultStyles.left, customStyles?.leftContainer]}
        >
          {!hideBack && (
            <PressableOpacity hitSlop={8} onPress={onBackPress} style={defaultStyles.backButton}>
              {backIcon ?? defaultBackIcon}
            </PressableOpacity>
          )}
          <Text numberOfLines={1} style={[defaultStyles.titleText, customStyles?.title]}>
            {title}
          </Text>
        </View>

        <View
          style={[defaultStyles.innerContainer, defaultStyles.right, customStyles?.rightContainer]}
        >
          <View style={defaultStyles.actionGroup}>
            {onDelete && (
              <Button
                onPress={onDelete}
                isLoading={isDeleting}
                loaderStyle={{ color: COLORS.teal700 }}
              >
                {deleteIcon ?? defaultDeleteIcon}
              </Button>
            )}
            {onSave && (
              <Button onPress={onSave} isLoading={isSaving} loaderStyle={{ color: COLORS.teal700 }}>
                {saveIcon ?? defaultSaveIcon}
              </Button>
            )}
            {onAdd && (
              <Button onPress={onAdd} isLoading={isAdding} loaderStyle={{ color: COLORS.teal700 }}>
                {addIcon ?? defaultAddIcon}
              </Button>
            )}
          </View>
        </View>
      </View>

      {extension && (
        <View style={[defaultStyles.extension, customStyles?.extensionContainer]}>{extension}</View>
      )}
    </View>
  );
}

const defaultStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    // boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.1)",
  },
  headerBar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  left: {
    alignItems: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
  titleText: {
    fontSize: FONT_SIZES.lg,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: -SPACING.sm,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  extension: {
    paddingBottom: SPACING.sm,
  },
});
