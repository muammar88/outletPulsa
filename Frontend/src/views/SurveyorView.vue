<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Daftar Surveyor</h2>

    <!-- Tombol tambah -->
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      @click="showAdd = true"
    >
      + Tambah Surveyor Baru
    </button>

    <!-- Tabel -->
    <SurveyorTable
      :surveyors="surveyors"
      @edit="openEdit"
      @delete="deleteSurveyor"
    />

    <!-- Modal Tambah -->
    <FormAdd
      v-if="showAdd"
      @close="showAdd = false"
      @saved="fetchSurveyors"
    />

    <!-- Modal Edit -->
    <FormEdit
      v-if="showEdit"
      :data="selectedSurveyor"
      @close="showEdit = false"
      @updated="fetchSurveyors"
    />
  </div>
</template>

<script>
import axios from "axios"
import SurveyorTable from "@/components/SurveyorTable.vue"
import FormAdd from "@/components/FormAdd.vue"
import FormEdit from "@/components/FormEdit.vue"

export default {
  components: { SurveyorTable, FormAdd, FormEdit },
  data() {
    return {
      surveyors: [],
      showAdd: false,
      showEdit: false,
      selectedSurveyor: null,
    }
  },
  methods: {
    async fetchSurveyors() {
      try {
        const res = await axios.get("http://localhost:3001/api/surveyor")
        this.surveyors = res.data
      } catch (err) {
        console.error("Gagal ambil data surveyor:", err)
      }
    },
    openEdit(surveyor) {
      this.selectedSurveyor = surveyor
      this.showEdit = true
    },
    async deleteSurveyor(id) {
      if (confirm("Yakin mau hapus surveyor ini?")) {
        try {
          await axios.delete(`http://localhost:3001/api/surveyor/${id}`)
          this.fetchSurveyors()
        } catch (err) {
          console.error("Gagal hapus surveyor:", err)
        }
      }
    },
  },
  mounted() {
    this.fetchSurveyors()
  },
}
</script>
