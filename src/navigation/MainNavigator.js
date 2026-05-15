import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const MessagesScreen = () => null;

const TABS = [
  { name: 'Home',     label: 'Discover', icon: 'compass',      iconOff: 'compass-outline'     },
  { name: 'Messages', label: 'Messages', icon: 'chatbubble',   iconOff: 'chatbubble-outline',  badge: 3  },
  { name: 'Likes',    label: 'Activity', icon: 'heart',        iconOff: 'heart-outline',       badge: 14 },
  { name: 'Profile',  label: 'Profile',  icon: 'person',       iconOff: 'person-outline'      },
];

// ─── Single Tab Button ────────────────────────────────────────────────────────
function TabButton({ tab, focused, onPress }) {
  const dotScale  = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dotScale, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        tension: 220,
        friction: 14,
      }),
      Animated.sequence([
        Animated.spring(iconScale, {
          toValue: focused ? 1.2 : 1,
          useNativeDriver: true,
          tension: 260,
          friction: 12,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 260,
          friction: 12,
        }),
      ]),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.tabBtn}>
      {/* Top indicator line — like Hinge */}
      <Animated.View style={[styles.topLine, { transform: [{ scaleX: dotScale }], opacity: dotScale }]} />

      {/* Icon */}
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Ionicons
          name={focused ? tab.icon : tab.iconOff}
          size={24}
          color={focused ? colors.primary : '#B0B0C8'}
        />
      </Animated.View>

      {/* Label */}
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {tab.label}
      </Text>

      {/* Badge */}
      {tab.badge && !focused && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.divider} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name) || TABS[index];
          const focused = state.index === index;
          return (
            <TabButton
              key={route.key}
              tab={tab}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────
export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Likes"    component={ActivityScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.07, shadowRadius: 14 },
      android: { elevation: 14 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE8F5',
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 8,
  },

  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
    gap: 4,
    position: 'relative',
  },

  // Hinge-style top accent line
  topLine: {
    position: 'absolute',
    top: -9,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#B0B0C8',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  badge: {
    position: 'absolute',
    top: 2,
    right: '16%',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});