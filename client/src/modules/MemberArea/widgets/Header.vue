<script setup lang="ts">
const dummyUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '081234567890',
  address: 'Jl. Kebon Sirih No. 35, RT.3/RW.6, Kb. Sirih, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10340',
}
</script>

<template>
  <header class="sticky top-0 z-10">
    <div
      class="w-full px-6 py-2.5 bg-white shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)] border-b border-black/10 inline-flex justify-between items-center overflow-hidden"
    >
      <div class="w-full max-w-[1340px] mx-auto flex justify-between items-center">
        <div class="w-48 h-14 relative">
          <img class="w-48 h-14 left-0 top-0 absolute" src="/images/ziwah.png" />
        </div>
        <div class="text-center justify-center text-sm italic">Hai, {{ dummyUser.name }}</div>
      </div>
    </div>
  </header>
</template>
