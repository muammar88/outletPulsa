//
<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Notification from "@/components/Modal/Notification.vue";
import BaseButton from "@/components/Button/BaseButton.vue";
import SelectField from "@/components/Form/SelectField.vue";
import InputText from "@/components/Form/InputText.vue";

// Composable
import { useNotification } from "@/composables/useNotification";

// Service
import { add_desa, get_desa, get_kecamatan } from "@/service/desa";

// Composable: notification
const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
} = useNotification();

interface Props {
  isModalOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "status", payload: { error_msg?: string; error?: boolean }): void;
}>();

// Function: Close modal
const closeModal = () => {
  resetForm();
  emit("close");
};

// Function: Reset form
const resetForm = () => {
  form.value.name = "";
  form.value.kecamatan_id = null;

  // Reset errors
  errors.value = {};
};

// Function: Fetch kecamatan list
const kecamatanOption = ref<Array<{ id: number; name: string }>>([]);

async function fetchKecamatan() {
  try {
    const response = await get_kecamatan();
    kecamatanOption.value =
      [{ id: null, name: "--- Pilih kecamatan ---" }, ...response.data] || [];
    console.log("Data kecamatan berhasil diambil:", kecamatanOption.value);
  } catch (error) {
    console.error("Gagal mengambil data kecamatan:", error);
    displayNotification("Gagal mengambil data kecamatan", "error");
  }
}

// Function: Fetch desa list

const desaOption = ref<Array<{ id: number; name: string }>>([]);

async function fetchDesa() {
  try {
    const response = await get_desa({
      page: 10,
      pageNumber: 1,
      search: "",
    });
    desaOption.value = response.data || [];
    console.log("Data desa berhasil diambil:", desaOption.value);
    // Ganti dengan service yang sesuai jika ada, misal get_desa()
    // const response = await get_desa()
    // desaOption.value = response.data || []
    // Sementara dummy data:
    desaOption.value = [];
  } catch (error) {
    console.error("Gagal mengambil data desa:", error);
    displayNotification("Gagal mengambil data desa", "error");
  }
}


// Function: Error handling
const errors = ref<Record<string, string>>({
  name: "",
  kecamatan_id: "",
});

const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.value = {};

  if (form.value.name === "") {
    errors.value.name = "Nama desa tidak boleh kosong.";
    isValid = false;
  }

  if (form.value.kecamatan_id === "") {
    errors.value.kecamatan_id = "kecamatan tidak boleh kosong.";
    isValid = false;
  }

  if (form.value.kecamatan_id === null) {
    errors.value.kecamatan_id = "Kecamatan tidak boleh kosong.";
    isValid = false;
  }

  console.log(errors.value);

  return isValid;
};

// Function: Handle submit
const isSubmitting = ref(false);
const form = ref<{ name: string; kecamatan_id: number | null }>({
  name: "",
  kecamatan_id: null,
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const payload = {
      name: form.value.name,
      kecamatan_id: (  form.value.kecamatan_id as number) || 0,
    };

    console.log("Payload yang dikirim:", payload);

    const response = await add_desa(payload);

    console.log("Response dari server:", response);

    emit("status", {
      error_msg: response?.error_msg || "",
      error: response?.error || false,
    });

    closeModal();
  } catch (error: any) {
    console.error("Error saat tambah desa:", error);

    if (error.response) {
      // server balas error
      displayNotification(
        error.response.data?.error_msg ||
          error.response.data?.message ||
          "Terjadi kesalahan di server",
        "error"
      );
    } else if (error.request) {
      // request dikirim tapi tidak ada respon
      displayNotification("Tidak ada respon dari server", "error");
    } else {
      // error lain (setup axios, dll)
      displayNotification(error.message || "Terjadi kesalahan tidak diketahui", "error");
    }
  } finally {
    isSubmitting.value = false;
  }
};
// Function: Handle escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isModalOpen) closeModal();
};
onMounted(async () => {
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(async () => {
  document.removeEventListener("keydown", handleEscape);
});

watch(
  () => props.isModalOpen,
  (val) => {
    if (val) fetchKecamatan();
  }
);


</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-xl font-semibold text-gray-800">
            Tambah Desa
          </h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Option Kecamatan -->
        <div class="text-gray-700">
          <SelectField
            id="kecamatan_id"
            v-model="form.kecamatan_id"
            :options="kecamatanOption"
            label="Pilih kecamatan"
            placeholder="Pilih kecamatan"
            :error="errors.kecamatan_id"
          />
        </div>

        <!-- Nama desa -->
        <div>
          <InputText
            id="name"
            v-model="form.name"
            label="name desa"
            type="text"
            placeholder="Masukkan name desa"
            :error="errors.name"
          />
        </div>

        <!-- Actions -->
        <div class="pt-4">
          <BaseButton
            type="submit"
            fullWidth
            variant="primary"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>Simpan</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
