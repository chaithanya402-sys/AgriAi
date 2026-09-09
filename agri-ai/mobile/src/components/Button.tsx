import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native'
import { colors } from '../theme/colors'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getContainerStyle = () => {
    const s: ViewStyle[] = [styles.button]
    if (size === 'sm') s.push(styles.sizeSm)
    else if (size === 'lg') s.push(styles.sizeLg)
    else s.push(styles.sizeMd)

    if (variant === 'primary') s.push(styles.variantPrimary)
    else if (variant === 'secondary') s.push(styles.variantSecondary)
    else if (variant === 'outline') s.push(styles.variantOutline)
    else if (variant === 'danger') s.push(styles.variantDanger)

    if (disabled || loading) s.push(styles.disabled)
    return s
  }

  const getTextStyle = () => {
    const s: TextStyle[] = [styles.text]
    if (size === 'sm') s.push(styles.textSm)
    else if (size === 'lg') s.push(styles.textLg)
    else s.push(styles.textMd)

    if (variant === 'primary' || variant === 'danger') s.push(styles.textLight)
    else if (variant === 'outline') s.push(styles.textOutline)
    else s.push(styles.textDark)

    return s
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? colors.brand : '#FFFFFF'}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sizeLg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  variantPrimary: {
    backgroundColor: colors.brand,
  },
  variantSecondary: {
    backgroundColor: colors.surfaceSubtle,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  variantDanger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 16,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textDark: {
    color: colors.textPrimary,
  },
  textOutline: {
    color: colors.brand,
  },
})
