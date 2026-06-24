import api from '@/service/api_administrator';

export class LabaDiambilService {
  static async getAll(query = '', perPage = 10, page = 1) {
    return api.get(`/administrator/laba-diambil`, {
      params: {
        query,
        limit: perPage,
        page,
      },
    });
  }

  static async getSummaryUnpaid() {
    return api.get(`/administrator/laba-diambil/summary-unpaid`);
  }

  static async takeLaba() {
    return api.post(`/administrator/laba-diambil/take`);
  }
}
