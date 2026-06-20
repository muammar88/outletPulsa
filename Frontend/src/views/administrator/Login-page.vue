<template>
  <div class="min-h-screen flex flex-col md:flex-row overflow-hidden" style="font-family: 'Poppins', sans-serif;">

    <!-- ═══ LEFT PANEL ═══════════════════════════════════════════════════ -->
    <div class="relative md:w-1/2 hidden md:flex items-center justify-center overflow-hidden">
      <!-- Deep gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>

      <!-- Animated grid pattern -->
      <div class="absolute inset-0 opacity-10" style="
        background-image: linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px);
        background-size: 48px 48px;
      "></div>

      <!-- Glow orbs -->
      <div class="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-600 rounded-full filter blur-[140px] opacity-30 orb-anim-1"></div>
      <div class="absolute -bottom-40 -right-20 w-[22rem] h-[22rem] bg-indigo-600 rounded-full filter blur-[120px] opacity-30 orb-anim-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16rem] h-[16rem] bg-cyan-500 rounded-full filter blur-[120px] opacity-15 orb-anim-3"></div>

      <!-- Content -->
      <div class="relative z-10 max-w-md w-full px-10 panel-enter">
        <!-- Brand -->
        <div class="flex items-center gap-3 mb-10">
          <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/30 logo-pulse p-1">
            <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div>
            <p class="text-white/50 text-xs font-semibold uppercase tracking-widest">Administrator</p>
            <h1 class="text-2xl font-extrabold text-white tracking-tight leading-none">Outlet Pulsa</h1>
          </div>
        </div>

        <!-- Headline -->
        <h2 class="text-4xl font-extrabold text-white leading-tight mb-4">
          Panel Kontrol
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Admin</span>
        </h2>
        <p class="text-blue-200/80 leading-relaxed mb-10 text-sm">
          Area terbatas khusus administrator. Kelola transaksi, pengguna, dan laporan sistem secara aman dan efisien.
        </p>

        <!-- Feature list -->
        <div class="space-y-3">
          <div v-for="f in features" :key="f.text"
            class="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ background: f.color + '22', border: '1px solid ' + f.color + '44' }">
              <component :is="f.icon" class="w-5 h-5" :style="{ color: f.color }" :stroke-width="2" />
            </div>
            <span class="text-white/75 text-sm font-medium">{{ f.text }}</span>
          </div>
        </div>

        <!-- Bottom badge -->
        <div class="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 backdrop-blur">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-white/60 text-xs font-medium">Sistem aktif &amp; aman — SSL 256-bit</span>
        </div>
      </div>
    </div>

    <!-- ═══ RIGHT PANEL ══════════════════════════════════════════════════ -->
    <div class="md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
      <div class="w-full max-w-md form-enter">

        <!-- Mobile brand (only visible on small screens) -->
        <div class="flex items-center justify-center gap-3 mb-8 md:hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <IconBolt class="w-5 h-5 text-white" :stroke-width="2.5" />
          </div>
          <h1 class="text-xl font-extrabold text-gray-800">Outlet Pulsa</h1>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 p-8 border border-gray-100/80">

          <!-- ═══ STEP 1: CREDENTIALS ═══ -->
          <transition name="step-fade" mode="out-in">
            <div v-if="loginStep === 'credentials'" key="credentials">
              <!-- Card Header -->
              <div class="text-center mb-8">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-inner">
                  <IconShieldLock class="w-8 h-8 text-blue-600" :stroke-width="1.8" />
                </div>
                <h2 class="text-2xl font-extrabold text-gray-900">Login Administrator</h2>
                <p class="text-gray-400 text-sm mt-1.5">Masukkan kredensial akun admin Anda</p>
              </div>

              <form class="space-y-5" @submit.prevent="handleLogin" novalidate>

                <!-- Username -->
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-gray-700">Username</label>
                  <div class="relative">
                    <span class="absolute top-1/2 -translate-y-1/2 left-4 flex items-center pointer-events-none z-10">
                      <IconUser class="w-5 h-5 text-gray-400" :stroke-width="2" />
                    </span>
                    <input
                      v-model="form.username"
                      type="text"
                      placeholder="Masukkan username"
                      class="input-field pl-12"
                      :class="{ 'input-field-error': errors.username }"
                      required
                      @blur="validateUsername"
                    />
                  </div>
                  <p v-if="errors.username" class="text-red-500 text-xs flex items-center gap-1">
                    <IconAlertCircle class="w-3.5 h-3.5" :stroke-width="2" />
                    {{ errors.username }}
                  </p>
                </div>

                <!-- Password -->
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-gray-700">Password</label>
                  <div class="relative">
                    <span class="absolute top-1/2 -translate-y-1/2 left-4 flex items-center pointer-events-none z-10">
                      <IconLock class="w-5 h-5 text-gray-400" :stroke-width="2" />
                    </span>
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Masukkan password"
                      class="input-field pl-12 pr-12"
                      :class="{ 'input-field-error': errors.password }"
                      required
                      @blur="validatePassword"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute top-1/2 -translate-y-1/2 right-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors z-10"
                    >
                      <IconEye v-if="!showPassword" class="w-5 h-5" :stroke-width="2" />
                      <IconEyeOff v-else class="w-5 h-5" :stroke-width="2" />
                    </button>
                  </div>
                  <p v-if="errors.password" class="text-red-500 text-xs flex items-center gap-1">
                    <IconAlertCircle class="w-3.5 h-3.5" :stroke-width="2" />
                    {{ errors.password }}
                  </p>
                </div>

                <!-- Remember + Forgot -->
                <div class="flex items-center justify-between text-sm">
                  <label class="flex items-center gap-2 text-gray-500 cursor-pointer group select-none">
                    <div class="relative">
                      <input type="checkbox" v-model="form.remember" class="sr-only peer" />
                      <div class="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                        <IconCheck class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" :stroke-width="3" />
                      </div>
                    </div>
                    Ingat saya
                  </label>
                  <a href="#" class="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors">Lupa password?</a>
                </div>

                <!-- Error global -->
                <transition name="error-fade">
                  <div v-if="loginError" class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                    <IconAlertCircle class="w-5 h-5 flex-shrink-0" :stroke-width="2" />
                    <p class="text-sm font-medium">{{ loginError }}</p>
                  </div>
                </transition>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="loading"
                  class="submit-btn"
                >
                  <span v-if="!loading" class="flex items-center justify-center gap-2">
                    <IconLogin class="w-5 h-5" :stroke-width="2" />
                    Masuk ke Dashboard
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Memproses...
                  </span>
                </button>
              </form>
            </div>

            <!-- ═══ STEP 2: OTP VERIFICATION ═══ -->
            <div v-else-if="loginStep === 'otp'" key="otp">
              <!-- Card Header -->
              <div class="text-center mb-8">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-inner">
                  <IconShieldCheck class="w-8 h-8 text-emerald-600" :stroke-width="1.8" />
                </div>
                <h2 class="text-2xl font-extrabold text-gray-900">Verifikasi 2FA</h2>
                <p class="text-gray-400 text-sm mt-1.5">Masukkan kode 6 digit dari Google Authenticator</p>
              </div>

              <form class="space-y-6" @submit.prevent="handleVerifyOtp" novalidate>

                <!-- OTP Input Boxes -->
                <div class="flex justify-center gap-3">
                  <input
                    v-for="(_, index) in 6"
                    :key="index"
                    :ref="el => { otpInputRefs[index] = el as HTMLInputElement }"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    class="otp-input"
                    :class="{
                      'otp-input-filled': otpDigits[index] !== '',
                      'otp-input-error': otpError
                    }"
                    :value="otpDigits[index]"
                    @input="handleOtpInput(index, $event)"
                    @keydown="handleOtpKeydown(index, $event)"
                    @paste="handleOtpPaste($event)"
                    @focus="otpError = false"
                  />
                </div>

                <!-- Timer visual -->
                <div class="flex items-center justify-center gap-2 text-sm">
                  <div class="relative w-6 h-6">
                    <svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" stroke-width="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" stroke-width="3"
                        stroke-dasharray="94.25" :stroke-dashoffset="94.25 - (94.25 * totpTimer / 30)"
                        stroke-linecap="round" class="transition-all duration-1000 ease-linear" />
                    </svg>
                  </div>
                  <span class="text-gray-500 font-medium">Kode berubah dalam <span class="text-emerald-600 font-bold">{{ totpTimer }}s</span></span>
                </div>

                <!-- Error OTP -->
                <transition name="error-fade">
                  <div v-if="loginError" class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                    <IconAlertCircle class="w-5 h-5 flex-shrink-0" :stroke-width="2" />
                    <p class="text-sm font-medium">{{ loginError }}</p>
                  </div>
                </transition>

                <!-- Verify Button -->
                <button
                  type="submit"
                  :disabled="loadingOtp || otpCode.length !== 6"
                  class="submit-btn"
                  :class="{ 'submit-btn-emerald': !loadingOtp && otpCode.length === 6 }"
                >
                  <span v-if="!loadingOtp" class="flex items-center justify-center gap-2">
                    <IconShieldCheck class="w-5 h-5" :stroke-width="2" />
                    Verifikasi Kode
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Memverifikasi...
                  </span>
                </button>

                <!-- Back button -->
                <button
                  type="button"
                  @click="goBackToCredentials"
                  class="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-semibold transition-colors py-2"
                >
                  <IconArrowLeft class="w-4 h-4" :stroke-width="2" />
                  Kembali ke halaman login
                </button>
              </form>
            </div>
          </transition>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <IconLock class="w-3.5 h-3.5" :stroke-width="2" />
          Koneksi terenkripsi · © {{ new Date().getFullYear() }} Outlet Pulsa
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { login_administrator, verify_2fa } from '@/service/auth';
import { setAdminLoggedIn } from '@/utils/cookies';
import { IconShieldLock,
  IconShieldCheck,
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconCheck,
  IconLogin,
  IconChartBar,
  IconUsers,
  IconReceipt,
  IconSettings,
  IconArrowLeft, } from '@/components/Icons';

const showPassword = ref(false);
const loading = ref(false);
const loadingOtp = ref(false);
const loginError = ref('');
const loginStep = ref<'credentials' | 'otp'>('credentials');
const tempToken = ref('');
const otpError = ref(false);

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  remember: false,
});

const errors = reactive({
  username: '',
  password: '',
});

// OTP state
const otpDigits = reactive<string[]>(['', '', '', '', '', '']);
const otpInputRefs = ref<(HTMLInputElement | null)[]>([]);
const otpCode = computed(() => otpDigits.join(''));

// TOTP timer (visual countdown 30s cycle)
const totpTimer = ref(30);
let totpInterval: ReturnType<typeof setInterval> | null = null;

function startTotpTimer() {
  // TOTP codes change every 30 seconds, synced to Unix time
  const updateTimer = () => {
    totpTimer.value = 30 - (Math.floor(Date.now() / 1000) % 30);
  };
  updateTimer();
  totpInterval = setInterval(updateTimer, 1000);
}

function stopTotpTimer() {
  if (totpInterval) {
    clearInterval(totpInterval);
    totpInterval = null;
  }
}

onUnmounted(() => {
  stopTotpTimer();
});

const features = [
  { icon: IconChartBar,  text: 'Dashboard laporan & statistik transaksi', color: '#60a5fa' },
  { icon: IconUsers,     text: 'Manajemen pengguna & hak akses',           color: '#818cf8' },
  { icon: IconReceipt,   text: 'Monitoring transaksi real-time',           color: '#34d399' },
  { icon: IconSettings,  text: 'Konfigurasi sistem & pengaturan global',   color: '#f59e0b' },
];

function validateUsername() {
  errors.username = form.username.trim() === '' ? 'Username tidak boleh kosong' : '';
}
function validatePassword() {
  errors.password = form.password.length < 6 ? 'Password minimal 6 karakter' : '';
}

// ─── OTP Input Handlers ────────────────────────────────────────────────

function handleOtpInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/[^0-9]/g, '');

  if (value.length > 0) {
    otpDigits[index] = value[0];
    if (index < 5) {
      nextTick(() => otpInputRefs.value[index + 1]?.focus());
    }
  } else {
    otpDigits[index] = '';
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (otpDigits[index] === '' && index > 0) {
      otpDigits[index - 1] = '';
      nextTick(() => otpInputRefs.value[index - 1]?.focus());
    } else {
      otpDigits[index] = '';
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    otpInputRefs.value[index - 1]?.focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    otpInputRefs.value[index + 1]?.focus();
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text')?.replace(/[^0-9]/g, '') || '';
  if (pastedData.length === 0) return;

  for (let i = 0; i < 6; i++) {
    otpDigits[i] = pastedData[i] || '';
  }

  // Focus terakhir yang terisi
  const lastIndex = Math.min(pastedData.length, 6) - 1;
  nextTick(() => otpInputRefs.value[lastIndex >= 0 ? lastIndex : 0]?.focus());
}

function clearOtp() {
  for (let i = 0; i < 6; i++) {
    otpDigits[i] = '';
  }
}

function goBackToCredentials() {
  loginStep.value = 'credentials';
  tempToken.value = '';
  loginError.value = '';
  otpError.value = false;
  clearOtp();
  stopTotpTimer();
}

// ─── Login Handlers ────────────────────────────────────────────────────

const handleLogin = async () => {
  validateUsername();
  validatePassword();
  if (errors.username || errors.password) return;

  loading.value = true;
  loginError.value = '';

  try {
    const response = await login_administrator({
      username: form.username.trim(),
      password: form.password,
    });

    if (response.status === 200 || response.status === 201) {
      const data = response.data?.data || response.data;

      // Cek apakah server meminta verifikasi 2FA
      if (data?.requiresTwoFactor) {
        tempToken.value = data.tempToken;
        loginStep.value = 'otp';
        loginError.value = '';
        startTotpTimer();
        nextTick(() => otpInputRefs.value[0]?.focus());
        return;
      }

      // Login langsung (2FA tidak aktif)
      setAdminLoggedIn(true);
      router.push('/backbone');
    } else {
      throw new Error(response.data?.message || 'Gagal login ke server');
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      loginError.value = error.response.data.message;
    } else {
      loginError.value = 'Username atau password salah. Silakan coba lagi.';
    }
  } finally {
    loading.value = false;
  }
};

const handleVerifyOtp = async () => {
  if (otpCode.value.length !== 6) return;

  loadingOtp.value = true;
  loginError.value = '';
  otpError.value = false;

  try {
    const response = await verify_2fa({
      tempToken: tempToken.value,
      otpCode: otpCode.value,
    });

    if (response.status === 200 || response.status === 201) {
      setAdminLoggedIn(true);
      stopTotpTimer();
      router.push('/backbone');
    } else {
      throw new Error(response.data?.message || 'Verifikasi gagal');
    }
  } catch (error: any) {
    otpError.value = true;
    clearOtp();
    nextTick(() => otpInputRefs.value[0]?.focus());

    if (error.response && error.response.data && error.response.data.message) {
      loginError.value = error.response.data.message;
    } else {
      loginError.value = 'Kode OTP salah atau sudah kedaluwarsa. Silakan coba lagi.';
    }
  } finally {
    loadingOtp.value = false;
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* Orb animations */
.orb-anim-1 { animation: orb1 14s ease-in-out infinite alternate; }
.orb-anim-2 { animation: orb2 18s ease-in-out infinite alternate-reverse; }
.orb-anim-3 { animation: orb3 10s ease-in-out infinite alternate; }

@keyframes orb1 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(80px, 60px) scale(1.2); }
}
@keyframes orb2 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(-60px,-80px) scale(1.15); }
}
@keyframes orb3 {
  0%   { transform: translate(-50%,-50%) scale(1); }
  100% { transform: translate(-50%,-50%) scale(1.4); }
}

/* Panel entrance animations */
.panel-enter {
  animation: panelIn 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes panelIn {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

.form-enter {
  animation: formIn 0.7s cubic-bezier(0.4,0,0.2,1) 0.1s both;
}
@keyframes formIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Logo pulse */
.logo-pulse {
  animation: logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
}

/* Input Fields */
.input-field {
  width: 100%;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 0.875rem;
  font-family: 'Poppins', sans-serif;
  color: #111827;
  background: #f9fafb;
  transition: all 0.25s ease;
  outline: none;
}
.input-field::placeholder { color: #9ca3af; }
.input-field:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
}
.input-field-error {
  border-color: #f87171 !important;
  background: #fff5f5 !important;
}
.input-field-error:focus {
  box-shadow: 0 0 0 4px rgba(248,113,113,0.15) !important;
}

/* OTP Input */
.otp-input {
  width: 3.25rem;
  height: 3.75rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  color: #111827;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  background: #f9fafb;
  outline: none;
  transition: all 0.25s ease;
  caret-color: #3b82f6;
}

.otp-input:focus {
  border-color: #10b981;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.12);
  transform: translateY(-2px);
}

.otp-input-filled {
  border-color: #10b981;
  background: #ecfdf5;
}

.otp-input-error {
  border-color: #f87171 !important;
  background: #fff5f5 !important;
  animation: otpShake 0.4s ease-in-out;
}

@keyframes otpShake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(59,130,246,0.35);
  position: relative;
  overflow: hidden;
}
.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.submit-btn:hover::before { opacity: 1; }
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(59,130,246,0.45);
}
.submit-btn:active { transform: translateY(0); }
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn-emerald {
  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
  box-shadow: 0 6px 20px rgba(16,185,129,0.35);
}
.submit-btn-emerald:hover {
  box-shadow: 0 10px 28px rgba(16,185,129,0.45);
}

/* Step transition */
.step-fade-enter-active { animation: stepIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }
.step-fade-leave-active { animation: stepOut 0.2s cubic-bezier(0.4,0,0.2,1) both; }

@keyframes stepIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes stepOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-12px) scale(0.98); }
}

/* Error alert transition */
.error-fade-enter-active, .error-fade-leave-active { transition: all 0.3s ease; }
.error-fade-enter-from { opacity: 0; transform: translateY(-8px); }
.error-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.w-4\.5 { width: 1.125rem; }
.h-4\.5 { height: 1.125rem; }
</style>
