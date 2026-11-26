import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function ScreenWrapper({ children, scrollable = true }: Props) {
  return (
    <View style={styles.outerWrapper}>
      <View style={styles.fullContainer}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fixedContent}>{children}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.background,
  },
  fullContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
    width: '100%',
  },
  fixedContent: {
    flex: 1,
    width: '100%',
  },
});