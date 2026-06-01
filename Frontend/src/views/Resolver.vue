<script setup lang="ts">
import { shallowRef, watchEffect, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

// Public
const PublicMainPage = defineAsyncComponent(() =>
  import('@/views/public/Main-page.vue')
);
const PublicPricePage = defineAsyncComponent(() =>
  import('@/views/public/Price-page.vue')
);
const PublicContactPage = defineAsyncComponent(() =>
  import('@/views/public/Contact-page.vue')
);

// Member
const MemberLoginPage = defineAsyncComponent(() =>
  import('@/views/member/Login-page.vue')
);
const MemberMainPage = defineAsyncComponent(() =>
  import('@/views/member/Main-page.vue')
);
const MemberRegistrationPage = defineAsyncComponent(() =>
  import('@/views/member/Registration-page.vue')
);

// Administrator
const AdministratorLoginPage = defineAsyncComponent(() =>
  import('@/views/administrator/Login-page.vue')
);
const AdministratorMainPage = defineAsyncComponent(() =>
  import('@/views/administrator/Main-page.vue')
);

// Notfound
const NotFound = defineAsyncComponent(() =>
  import('@/views/errors/NotFoundView.vue')
);

const currentComponent = shallowRef<any>(null);
const route = useRoute();

watchEffect(() => {
  const layout = route.meta.layout;

  if (layout === 'landing-page') {
    currentComponent.value = PublicMainPage;
  } else if (layout === 'member-login-page') {
    currentComponent.value = MemberLoginPage;
  } else if (layout === 'member-registration-page') {
    currentComponent.value = MemberRegistrationPage;
  } else if (layout === 'member-page') {
    currentComponent.value = MemberMainPage;
  } else if (layout === 'price-page') {
    currentComponent.value = PublicPricePage;
  } else if (layout === 'contact-page') {
    currentComponent.value = PublicContactPage;
  } else if (layout === 'login-backbone-page') {
    currentComponent.value = AdministratorLoginPage;
  } else if (layout === 'backbone-page') {
    currentComponent.value = AdministratorMainPage;
  } else {
    currentComponent.value = NotFound;
  }
});
</script>

<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>
