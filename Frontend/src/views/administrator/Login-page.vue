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
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 logo-pulse">
            <IconBolt class="w-7 h-7 text-white" :stroke="2.5" />
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
              <component :is="f.icon" class="w-5 h-5" :style="{ color: f.color }" :stroke="2" />
            </div>
            <span class="text-white/75 text-sm font-medium">{{ f.text }}</span>
          </div>
        </div>

        <!-- Bottom badge -->
        <div class="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 backdrop-blur">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-white/60 text-xs font-medium">Sistem aktif & aman — SSL 256-bit</span>
        </div>
      </div>
    </div>

    <!-- ═══ RIGHT PANEL ══════════════════════════════════════════════════ -->
    <div class="md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
      <div class="w-full max-w-md form-enter">

        <!-- Mobile brand (only visible on small screens) -->
        <div class="flex items-center justify-center gap-3 mb-8 md:hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <IconBolt class="w-5 h-5 text-white" :stroke="2.5" />
          </div>
          <h1 class="text-xl font-extrabold text-gray-800">Outlet Pulsa</h1>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 p-8 border border-gray-100/80">

          <!-- Card Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-inner">
              <IconShieldLock class="w-8 h-8 text-blue-600" :stroke="1.8" />
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
                  <IconUser class="w-5 h-5 text-gray-400" :stroke="2" />
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
                <IconAlertCircle class="w-3.5 h-3.5" :stroke="2" />
                {{ errors.username }}
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Password</label>
              <div class="relative">
                <span class="absolute top-1/2 -translate-y-1/2 left-4 flex items-center pointer-events-none z-10">
                  <IconLock class="w-5 h-5 text-gray-400" :stroke="2" />
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
                  <IconEye v-if="!showPassword" class="w-5 h-5" :stroke="2" />
                  <IconEyeOff v-else class="w-5 h-5" :stroke="2" />
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs flex items-center gap-1">
                <IconAlertCircle class="w-3.5 h-3.5" :stroke="2" />
                {{ errors.password }}
              </p>
            </div>

            <!-- Remember + Forgot -->
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-gray-500 cursor-pointer group select-none">
                <div class="relative">
                  <input type="checkbox" v-model="form.remember" class="sr-only peer" />
                  <div class="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                    <IconCheck class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" :stroke="3" />
                  </div>
                </div>
                Ingat saya
              </label>
              <a href="#" class="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors">Lupa password?</a>
            </div>

            <!-- Error global -->
            <transition name="error-fade">
              <div v-if="loginError" class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                <IconAlertCircle class="w-5 h-5 flex-shrink-0" :stroke="2" />
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
                <IconLogin class="w-5 h-5" :stroke="2" />
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

        <p class="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <IconLock class="w-3.5 h-3.5" :stroke="2" />
          Koneksi terenkripsi · © {{ new Date().getFullYear() }} Outlet Pulsa
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import {
  IconBolt,
  IconShieldLock,
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
} from '@tabler/icons-vue';

const showPassword = ref(false);
const loading = ref(false);
const loginError = ref('');

const form = reactive({
  username: '',
  password: '',
  remember: false,
});

const errors = reactive({
  username: '',
  password: '',
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

const handleLogin = async () => {
  validateUsername();
  validatePassword();
  if (errors.username || errors.password) return;

  loading.value = true;
  loginError.value = '';

  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // TODO: actual login logic
    alert(`Login berhasil: ${form.username}`);
  } catch {
    loginError.value = 'Username atau password salah. Silakan coba lagi.';
  } finally {
    loading.value = false;
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

/* Error alert transition */
.error-fade-enter-active, .error-fade-leave-active { transition: all 0.3s ease; }
.error-fade-enter-from { opacity: 0; transform: translateY(-8px); }
.error-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.w-4\.5 { width: 1.125rem; }
.h-4\.5 { height: 1.125rem; }
</style>
