import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { login, register } = useAuthStore();
    const { colors, isDarkMode } = useThemeStore();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let success = false;
            if (isLogin) {
                success = await login(email, password);
            } else {
                success = await register(name, email, password);
            }

            if (success) {
                router.replace('/(tabs)');
            } else {
                setError('Invalid credentials.');
            }
        } catch (err: any) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Heart Logo Section */}
                    <View style={s.logoArea}>
                        <LinearGradient
                            colors={['#00D4FF', '#FFE600']}
                            style={s.logoCircle}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="heart" size={40} color="#FFF" />
                        </LinearGradient>
                        <Text style={[s.logoText, { color: colors.textPrimary }]}>PintigButuan</Text>
                        <Text style={[s.logoSub, { color: colors.textSecondary }]}>The Digital Heartbeat of the City</Text>
                    </View>

                    {/* Tab Switcher */}
                    <View style={[s.tabContainer, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity
                            style={[s.tab, isLogin && s.activeTab]}
                            onPress={() => setIsLogin(true)}
                        >
                            <Text style={[s.tabText, isLogin && s.activeTabText, !isLogin && { color: colors.textSecondary }]}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.tab, !isLogin && s.activeTab]}
                            onPress={() => setIsLogin(false)}
                        >
                            <Text style={[s.tabText, !isLogin && s.activeTabText, isLogin && { color: colors.textSecondary }]}>Register</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Section */}
                    <View style={s.formArea}>
                        {error && (
                            <Text style={{ color: '#FF3B30', marginBottom: 10, textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>{error}</Text>
                        )}
                        {!isLogin && (
                            <View style={s.inputField}>
                                <Text style={[s.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
                                <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                                    <TextInput
                                        style={[s.input, { color: colors.textPrimary }]}
                                        placeholder="John Doe"
                                        placeholderTextColor={colors.textMuted}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={s.inputField}>
                            <Text style={[s.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
                            <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons name="at-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.textPrimary }]}
                                    placeholder="name@butuan.gov"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={s.inputField}>
                            <Text style={[s.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                            <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.textPrimary }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <View style={s.optionsRow}>
                            <TouchableOpacity
                                style={s.rememberRow}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <Ionicons
                                    name={rememberMe ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={rememberMe ? colors.primary : colors.textMuted}
                                />
                                <Text style={[s.rememberText, { color: colors.textSecondary }]}>Remember me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={s.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={s.submitBtn}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#0052CC']}
                                style={s.submitGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={s.submitText}>Enter the Pulse</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={s.dividerContainer}>
                            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[s.dividerText, { color: colors.textMuted }]}>OR CONTINUE WITH</Text>
                            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        <View style={s.socialRow}>
                            {['logo-google', 'logo-facebook', 'logo-apple'].map((icon, idx) => (
                                <TouchableOpacity key={idx} style={[s.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Ionicons name={icon as any} size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Bottom Security Banner */}
                    <View style={s.footer}>
                        <Text style={[s.termsText, { color: colors.textMuted }]}>
                            By joining, you agree to our <Text style={s.termsLink}>Terms of Service</Text>
                        </Text>
                        <View style={[s.securityBanner, { backgroundColor: isDarkMode ? 'rgba(0, 200, 83, 0.05)' : 'rgba(0, 200, 83, 0.1)' }]}>
                            <Ionicons name="shield-checkmark" size={18} color="#00C851" />
                            <Text style={s.securityText}>Secure, Verified City Intelligence Access</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20
    },
    logoArea: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80, height: 80, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 15, elevation: 10,
    },
    logoText: { fontSize: 24, fontWeight: 'bold' },
    logoSub: { fontSize: 13, marginTop: 4 },

    tabContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 6,
        marginBottom: 30,
    },
    tab: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#0066FF',
        shadowColor: '#0066FF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, shadowRadius: 10, elevation: 5,
    },
    tabText: { fontWeight: 'bold' },
    activeTabText: { color: '#FFF' },

    formArea: { width: '100%' },
    inputField: { marginBottom: 20 },
    inputLabel: { fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 16, paddingHorizontal: 16, height: 56,
        borderWidth: 1,
    },
    input: { flex: 1, fontSize: 16, marginLeft: 12 },

    optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rememberText: { fontSize: 13 },
    forgotText: { color: '#0066FF', fontSize: 13, fontWeight: 'bold' },

    submitBtn: {
        borderRadius: 20, overflow: 'hidden',
        height: 64, marginBottom: 40,
    },
    submitGradient: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 10, fontWeight: 'bold' },

    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    socialBtn: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },

    footer: { alignItems: 'center', marginTop: 40 },
    termsText: { fontSize: 12, marginBottom: 20 },
    termsLink: { color: '#0066FF', fontWeight: 'bold' },
    securityBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0, 200, 83, 0.2)',
    },
    securityText: { color: '#00C851', fontSize: 11, fontWeight: 'bold' },
});
