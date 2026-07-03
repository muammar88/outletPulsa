export class TransactionUpdatedDto {
  transactionId: string | number;
  status: string;
  sn?: string;
  price?: number;
  updatedAt: Date | string;
  // Add other fields as necessary based on your schema
}
