export class GetRiwayatDto {
  page?: string;
  limit?: string;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
}
