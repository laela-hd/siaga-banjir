import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F294A',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarStyle: [
          styles.tabBarBase,
          isDesktop ? styles.tabBarDesktop : styles.tabBarMobile,
        ],
        tabBarLabelStyle: isDesktop ? styles.labelDesktop : styles.labelMobile,
        tabBarItemStyle: isDesktop ? styles.itemDesktop : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={isDesktop ? 18 : 20}
                color={color as string}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="peta"
        options={{
          title: 'Peta Banjir',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                size={isDesktop ? 18 : 20}
                color={color as string}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="laporan"
        options={{
          title: 'Lapor',
          tabBarIcon: () => <Ionicons name="add" size={26} color="#FFFFFF" />,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              activeOpacity={0.85}
              style={isDesktop ? styles.desktopFabWrapper : styles.mobileFabWrapper}
            >
              {isDesktop ? (
                <View style={styles.desktopReportBtn}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.desktopReportText}>Lapor Banjir</Text>
                </View>
              ) : (
                <View style={styles.mobileFabCircle}>
                  <Ionicons name="add" size={28} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="notifikasi"
        options={{
          title: 'Notifikasi',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={isDesktop ? 18 : 20}
                color={color as string}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={isDesktop ? 18 : 20}
                color={color as string}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBase: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarMobile: {
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingTop: 8,
  },
  tabBarDesktop: {
    height: 64,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  itemDesktop: {
    maxWidth: 200,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  labelMobile: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  labelDesktop: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  iconPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iconPillActive: {
    backgroundColor: 'rgba(15, 41, 74, 0.1)',
  },

  // Tampilan Tombol Lapor di HP (Bulat Melayang)
  mobileFabWrapper: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileFabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },

  // Tampilan Tombol Lapor di Web Desktop (Kapsul Sejajar)
  desktopFabWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  desktopReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  desktopReportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});