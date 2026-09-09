import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { colors } from '../theme/colors'

interface BadgeProps {
  label: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function Badge({
  label,
  variant = 'primary',
  size = 'sm',
  style,
  textStyle,
}: BadgeProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: colors.successLight }
      case 'warning':
        return { backgroundColor: colors.warningLight }
      case 'danger':
        return { backgroundColor: colors.dangerLight }
      case 'info':
        return { backgroundColor: colors.infoLight }
      case 'neutral':
        return { backgroundColor: colors.surfaceSubtle }
      case 'primary':
      default:
        return { backgroundColor: colors.brandTonal }
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.success
      case 'warning':
        return colors.earth600
      case 'danger':
        return colors.danger
      case 'info':
        return colors.info
      case 'neutral':
        return colors.textSecondary
      case 'primary':
      default:
        return colors.brand
    }
  }

  return (
    <View
      style={[
        styles.badge,
        size === 'md' ? styles.badgeMd : styles.badgeSm,
        getContainerStyle(),
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'md' ? styles.textMd : styles.textSm,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeMd: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 13,
  },
})
