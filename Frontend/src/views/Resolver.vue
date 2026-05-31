<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Public
import PublicMainPage from '@/views/public/Main-page.vue';
import PublicPricePage from '@/views/public/Price-page.vue';
import PublicContactPage from '@/views/public/Contact-page.vue';

// Member
import MemberLoginPage from '@/views/member/Login-page.vue';
import MemberMainPage from '@/views/member/Main-page.vue';
import MemberRegistrationPage from '@/views/member/Registration-page.vue';

// Administrator
import AdministratorLoginPage from '@/views/administrator/Login-page.vue';
import AdministratorMainPage from '@/views/administrator/Main-page.vue';

// Notfound
import NotFound from '@/views/errors/NotFoundView.vue';

const currentComponent = ref<any>(null);
const route = useRoute();

onMounted(() => {
  const layout = route.meta.layout;

  if (layout === 'landing-page') {
    currentComponent.value = PublicMainPage;
  } else if( layout == 'member-login-page') {
    currentComponent.value = MemberLoginPage;
  } else if ( layout == 'member-registration-page') {
    currentComponent.value = MemberRegistrationPage;
  } else if ( layout == 'member-page') {
    currentComponent.value = MemberMainPage;
  } else if ( layout == 'price-page') {
    currentComponent.value = PublicPricePage;
  } else if ( layout == 'contact-page') {
    currentComponent.value = PublicContactPage;
  } else if ( layout == 'login-backbone-page') {
    currentComponent.value = AdministratorLoginPage;
  } else if ( layout == 'backbone-page') {
    currentComponent.value = AdministratorMainPage;
  } else {
    currentComponent.value = NotFound;
  }

});
</script>

<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>
