<template>
  <div class="flex items-center gap-3">
    <a href="#" class="social-icon-btn group" title="Facebook">
      <div class="absolute inset-0 bg-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <IconBrandFacebook class="w-5 h-5 relative z-10 group-hover:text-white transition-colors" :stroke-width="2" />
    </a>
    <a href="#" class="social-icon-btn group" title="Instagram">
      <div class="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <IconBrandInstagram class="w-5 h-5 relative z-10 group-hover:text-white transition-colors" :stroke-width="2" />
    </a>
    <a href="#" class="social-icon-btn group" title="TikTok">
      <div class="absolute inset-0 bg-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <IconBrandTiktok class="w-5 h-5 relative z-10 group-hover:text-white transition-colors" :stroke-width="2" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok } from '@/components/Icons';
</script>

<style scoped>
/* Social Icons */
.social-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.social-icon-btn:hover {
  transform: translateY(-4px);
  border-color: transparent;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}
</style>
