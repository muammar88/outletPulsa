<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Logout from '@/views/administrator/components/Header/Logout.vue';
import ModalEditProfile from '@/views/administrator/components/Header/ModalEditProfile.vue';
import Modal2FA from '@/views/administrator/components/Header/Modal2FA.vue';
import { SettingStore } from '@/stores/settings';
import { IconChevronDown, IconUserEdit, IconShieldLock } from '@/components/Icons';

const target = ref(null);
const dropdownOpen = ref(false);
const logoutRef = ref(null);

const SettingGlob = SettingStore();

onClickOutside(target, () => {
  dropdownOpen.value = false;
});

const handleLogoutClick = () => {
  if (logoutRef.value) {
    logoutRef.value.showLogoutConfirmation();
  }
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const showModal = ref(false);
const ModalEdit = ref(false);
const Modal2FAState = ref(false);

const openModalEdit = () => {
  ModalEdit.value = true;
};

const openModal2FA = () => {
  Modal2FAState.value = true;
};

const showNotification = ref(false);
const notificationType = ref<'success' | 'error'>('success');
const notificationMessage = ref('');

function showNotif(payload: { type: 'success' | 'error'; message: string }) {
  notificationType.value = payload.type;
  notificationMessage.value = payload.message;
  showNotification.value = true;

  setTimeout(() => {
    showNotification.value = false;
  }, 4000);
}
</script>

<template>
  <div class="relative" ref="target">
    <!-- TRIGGER BUTTON -->
    <button
      class="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-white transition-all duration-200 group"
      @click.prevent="dropdownOpen = !dropdownOpen"
    >
      <!-- Avatar with gradient ring -->
      <div class="relative">
        <div class="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div class="relative h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img src="@/assets/images/user/avatar.webp" alt="User" class="w-full h-full object-cover" />
        </div>
      </div>
      <!-- Name & Role -->
      <span class="hidden text-left lg:block pr-1">
        <span class="block text-[13px] font-bold text-slate-800 leading-tight">{{ SettingGlob.sharedObject.name || 'Administrator' }}</span>
        <span class="block text-[10px] font-semibold text-blue-500 uppercase tracking-widest leading-tight mt-0.5">{{ SettingGlob.sharedObject.grup || 'Admin' }}</span>
      </span>
      <!-- Chevron -->
      <IconChevronDown
        class="hidden sm:block text-slate-400 group-hover:text-blue-400 transition-all duration-300"
        :class="dropdownOpen ? 'rotate-180 text-blue-500' : ''"
        :size="15"
        :stroke-width="2.5"
      />
    </button>

    <!-- DROPDOWN CONTENT WITH FULL ANIMATION -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-2"
    >
      <div
        v-show="dropdownOpen"
        class="absolute right-0 top-full mt-3 flex w-64 flex-col rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-xl shadow-blue-900/10 overflow-hidden"
      >
        <div class="px-2 py-2 border-b border-slate-100">
          <button
            @click="openModalEdit"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <div class="bg-blue-100 p-1.5 rounded-lg text-blue-600">
              <IconUserEdit :size="18" :stroke-width="2" />
            </div>
            Edit Profile
          </button>
          
          <button
            @click="openModal2FA"
            class="w-full flex items-center gap-3 px-4 py-2.5 mt-1 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
          >
            <div class="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <IconShieldLock :size="18" :stroke-width="2" />
            </div>
            Keamanan Akun
          </button>
        </div>
        
        <div class="px-2 py-2 bg-slate-50" @click="handleLogoutClick">
          <Logout ref="logoutRef" @close-dropdown="closeDropdown" />
        </div>
      </div>
    </transition>
  </div>

  <ModalEditProfile
    :formStatus="ModalEdit"
    @cancel="ModalEdit = false"
    @submitted="ModalEdit = false"
    @notify="showNotif"
  />

  <Modal2FA
    :formStatus="Modal2FAState"
    @cancel="Modal2FAState = false"
    @notify="showNotif"
  />

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
