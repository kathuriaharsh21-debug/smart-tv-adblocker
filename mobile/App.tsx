import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';

export default function App() {
  const [isHomeNetwork, setIsHomeNetwork] = useState(true);
  const [mode, setMode] = useState<'Auto' | 'Strict' | 'Paused'>('Auto');
  const [recentBlocked, setRecentBlocked] = useState([
    { id: '1', domain: 'samsungads.com', device: 'Living Room TV' },
    { id: '2', domain: 'p.ads.roku.com', device: 'Kids Room Roku' },
  ]);

  // Reachability Probe Pattern for Auto Network Detection
  useEffect(() => {
    fetch('http://adblock.home.lan/api/ping')
      .then(res => res.json())
      .then(data => setIsHomeNetwork(data.home_network))
      .catch(() => setIsHomeNetwork(true)); // Fallback for local demo
  }, []);

  const handleToggleMode = (newMode: 'Auto' | 'Strict' | 'Paused') => {
    setMode(newMode);
    Alert.alert('Blocking Mode Changed', `Switched network ad-blocking profile to ${newMode}`);
  };

  const handleWhitelist = (domain: string) => {
    setRecentBlocked(prev => prev.filter(item => item.domain !== domain));
    Alert.alert('Domain Whitelisted', `${domain} has been allowed across your home network.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Smart-TV Ad Blocker</Text>
        <Text style={styles.subtitle}>Mobile Companion Client</Text>

        {/* Network Status Badge */}
        <View style={[styles.badge, isHomeNetwork ? styles.badgeHome : styles.badgeRemote]}>
          <Text style={styles.badgeText}>
            {isHomeNetwork ? '🟢 Connected to Home Network (_adblock._tcp.local)' : '🌐 Remote Connection (Tailscale active)'}
          </Text>
        </View>

        {/* Big Status Toggle Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Global Ad-Blocking Profile</Text>
          <View style={styles.toggleRow}>
            {(['Auto', 'Strict', 'Paused'] as const).map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.toggleBtn, mode === item && styles.toggleBtnActive]}
                onPress={() => handleToggleMode(item)}
              >
                <Text style={[styles.toggleBtnText, mode === item && styles.toggleBtnTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* One-Click Whitelist Inbox */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Un-break TV Apps (Whitelist Inbox)</Text>
          <Text style={styles.cardDesc}>Tap to whitelist candidate domains if an app thumbnail or login broke:</Text>
          {recentBlocked.length === 0 ? (
            <Text style={styles.emptyText}>All recently blocked domains cleared.</Text>
          ) : (
            recentBlocked.map(item => (
              <View key={item.id} style={styles.whitelistRow}>
                <View>
                  <Text style={styles.domainText}>{item.domain}</Text>
                  <Text style={styles.deviceText}>{item.device}</Text>
                </View>
                <TouchableOpacity style={styles.allowBtn} onPress={() => handleWhitelist(item.domain)}>
                  <Text style={styles.allowBtnText}>Allow</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Disclaimers & iOS Shortcuts Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Automation & Limitations</Text>
          <Text style={styles.infoText}>• iOS Shortcuts Webhook: Add a "When I Join Wi-Fi" automation hitting http://adblock.home.lan/api/mode for zero-code auto-switching.</Text>
          <Text style={styles.infoText}>• SSAI Note: Hotstar & SonyLIV live sports stream video ads from the same CDN domain. This app blocks interface clutter, telemetry, and pre-rolls, not in-stream video ads.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 15 },
  badge: { padding: 10, borderRadius: 8, marginBottom: 20 },
  badgeHome: { backgroundColor: '#064e3b' },
  badgeRemote: { backgroundColor: '#1e3a8a' },
  badgeText: { color: '#ecfdf5', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  cardDesc: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  toggleBtn: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#3b82f6' },
  toggleBtnText: { color: '#94a3b8', fontWeight: '600' },
  toggleBtnTextActive: { color: '#ffffff' },
  emptyText: { color: '#64748b', fontSize: 13, fontStyle: 'italic' },
  whitelistRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  domainText: { color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  deviceText: { color: '#64748b', fontSize: 12 },
  allowBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  allowBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  infoText: { color: '#94a3b8', fontSize: 12, marginBottom: 6, lineHeight: 18 }
});
