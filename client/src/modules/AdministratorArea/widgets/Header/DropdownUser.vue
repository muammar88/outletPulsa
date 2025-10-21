<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Logout from '@/modules/AdministratorArea/widgets/Header/Logout.vue';
import ModalEditProfile from '@/modules/AdministratorArea/widgets/Header/ModalEditProfile.vue';
// import { CompanyCode, Name, Jabatan } from '@/stores/profile'
import { SettingStore } from '@/stores/settings';

const target = ref(null);
const dropdownOpen = ref(false);
const logoutRef = ref(null);

// const settings = SettingStore()
const SettingGlob = SettingStore();
// const name = Name()
// const jabatan = Jabatan()

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

const openModalEdit = () => {
  ModalEdit.value = true;
};

const showNotification = ref(false);
const notificationType = ref<'success' | 'error'>('success');
const notificationMessage = ref('');

function showNotif(payload: { type: 'success' | 'error'; message: string }) {
  console.log('📩 Parent menerima notif:', payload);
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
    <router-link
      class="flex items-center gap-4"
      to="#"
      @click.prevent="dropdownOpen = !dropdownOpen"
    >
      <span class="hidden text-right lg:block">
        <span class="block text-sm font-medium text-green-900 dark:text-white">{{
          SettingGlob.sharedObject.name
        }}</span>
        <span class="block text-xs font-bold text-green-900 dark:text-white"
          >As {{ SettingGlob.sharedObject.grup }}</span
        >
      </span>
      <span class="h-12 w-12 rounded-full">
        <img src="@/assets/images/user/avatar.png" alt="User" />
      </span>
      <svg
        :class="dropdownOpen && 'rotate-180'"
        class="hidden fill-current sm:block"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
          fill=""
        />
      </svg>
    </router-link>
    <div
      v-show="dropdownOpen"
      class="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <ul class="flex flex-col gap-5 border-b border-stroke px-6 py-6 dark:border-strokedark">
        <li>
          <button
            @click="openModalEdit"
            class="flex items-center gap-3.5 text-sm font-medium duration-300 text-green-900 ease-in-out hover:text-green-700 lg:text-base"
          >
            <svg
              class="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z"
              />
              <path
                d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z"
              />
            </svg>
            Edit Profile
          </button>
        </li>
      </ul>
      <div @click="handleLogoutClick">
        <Logout ref="logoutRef" @close-dropdown="closeDropdown" />
      </div>
    </div>
  </div>

  <ModalEditProfile
    :formStatus="ModalEdit"
    @cancel="ModalEdit = false"
    @submitted="ModalEdit = false"
    @notify="showNotif"
  />

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
