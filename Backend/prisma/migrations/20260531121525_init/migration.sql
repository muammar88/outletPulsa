-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('unverified', 'verfied');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('outletpulsa', 'amra');

-- CreateEnum
CREATE TYPE "AgenType" AS ENUM ('silver', 'gold', 'platinum');

-- CreateEnum
CREATE TYPE "ServerStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ProdukType" AS ENUM ('prabayar', 'pascabayar');

-- CreateEnum
CREATE TYPE "ProdukStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "FeeAgenStatus" AS ENUM ('paid', 'unpaid');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('proses', 'gagal', 'sukses');

-- CreateEnum
CREATE TYPE "StatusKirim" AS ENUM ('sudah_kirim', 'belum_kirim');

-- CreateEnum
CREATE TYPE "ActionDo" AS ENUM ('member', 'admin', 'almutasi');

-- CreateEnum
CREATE TYPE "TipeTransaksi" AS ENUM ('deposit', 'beli_produk_prabayar', 'beli_produk_pascabayar', 'rental_amra', 'tranfer_saldo', 'terima_saldo');

-- CreateEnum
CREATE TYPE "RiwayatMutasiStatus" AS ENUM ('deposit', 'internal_transaction');

-- CreateEnum
CREATE TYPE "ResetPasswordStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid');

-- CreateEnum
CREATE TYPE "DigiflazzSellerStatus" AS ENUM ('banned', 'unbanned');

-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('credit', 'debet');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('deposit', 'deposit_promo', 'withdraw');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "refreshToken" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "whatsappnumber" TEXT NOT NULL,
    "kode_agen" TEXT,
    "password" TEXT NOT NULL,
    "saldo" INTEGER DEFAULT 0,
    "status" "MemberStatus" NOT NULL DEFAULT 'unverified',
    "type" "MemberType",
    "agenType" "AgenType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "nama" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransferOutlet" (
    "id" SERIAL NOT NULL,
    "bankId" INTEGER,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransferOutlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "name" TEXT,
    "type" "ProdukType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "kategoriId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefix" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER,
    "prefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "name" TEXT,
    "status" "ServerStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "type" "ProdukType",
    "purchase_price" INTEGER,
    "markup" INTEGER,
    "serverId" INTEGER,
    "status" "ProdukStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukPascabayar" (
    "id" SERIAL NOT NULL,
    "kategoriId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "fee" INTEGER,
    "comission" INTEGER,
    "outletFee" INTEGER,
    "serverId" INTEGER,
    "status" "ProdukStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdukPascabayar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "type" "ProdukType",
    "produkId" INTEGER,
    "riwayatTransaksiId" INTEGER,
    "nomorTujuan" TEXT,
    "ket" TEXT,
    "purchase_price" INTEGER,
    "selling_price" INTEGER,
    "kodeAgen" TEXT,
    "laba" INTEGER,
    "fee_agen" INTEGER,
    "status_fee_agen" "FeeAgenStatus" DEFAULT 'unpaid',
    "serverId" INTEGER,
    "status" "TransactionStatus" DEFAULT 'proses',
    "trx_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionPascabayar" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "trId" TEXT,
    "produkId" INTEGER,
    "riwayatTransaksiId" INTEGER,
    "nomorTujuan" TEXT,
    "trName" TEXT,
    "ket" TEXT,
    "nominal" INTEGER,
    "totalNominal" INTEGER,
    "adminFee" INTEGER,
    "comission" INTEGER,
    "outletComission" INTEGER,
    "memberComission" INTEGER,
    "noref" TEXT,
    "tarif" TEXT,
    "daya" INTEGER,
    "total" INTEGER,
    "kodeAgen" TEXT,
    "laba" INTEGER,
    "fee_agen" INTEGER,
    "status_fee_agen" "FeeAgenStatus" DEFAULT 'unpaid',
    "serverId" INTEGER,
    "status" "TransactionStatus" DEFAULT 'proses',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionPascabayar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDeposit" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "riwayatTransaksiId" INTEGER,
    "nominal" INTEGER,
    "nominalTambahan" INTEGER,
    "status" "TransactionStatus" DEFAULT 'proses',
    "bankTransferId" INTEGER,
    "waktuRequest" TIMESTAMP(3),
    "statusKirim" "StatusKirim" DEFAULT 'belum_kirim',
    "alasanPenolakan" TEXT,
    "actionDo" "ActionDo",
    "count_penolakan" INTEGER,
    "waktuKirim" TIMESTAMP(3),
    "waktuNotifikasi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatTransaksi" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER,
    "tipeTransaksi" "TipeTransaksi",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiwayatTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatMutasi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "bankId" INTEGER,
    "nominal" INTEGER,
    "kodeNominal" INTEGER,
    "requestId" INTEGER,
    "status" "RiwayatMutasiStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiwayatMutasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmraRentalFee" (
    "id" SERIAL NOT NULL,
    "riwayatTransaksiId" INTEGER,
    "biaya" INTEGER,
    "ket" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmraRentalFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferSaldo" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "riwayatTransaksiId" INTEGER,
    "biaya" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferSaldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerimaSaldo" (
    "id" SERIAL NOT NULL,
    "kode" TEXT,
    "riwayatTransaksiId" INTEGER,
    "biaya" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerimaSaldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notif" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotifMemberRead" (
    "id" SERIAL NOT NULL,
    "notifId" INTEGER,
    "memberId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotifMemberRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPassword" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER,
    "password_reset" TEXT,
    "resetValue" TEXT,
    "datetime" TIMESTAMP(3),
    "status" "ResetPasswordStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER,
    "kode_agen" TEXT,
    "biaya" INTEGER,
    "paymentStatus" "PaymentStatus" DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzType" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzProduct" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER,
    "categoryId" INTEGER,
    "brandId" INTEGER,
    "typeId" INTEGER,
    "name" TEXT,
    "selectedSellerBuyerSkuKode" TEXT,
    "selectedSellerPrice" INTEGER,
    "selectedSellerStartCutOff" TIME,
    "selectedSellerEndCutOff" TIME,
    "status" "ProdukStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzSeller" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" "DigiflazzSellerStatus" DEFAULT 'unbanned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzSeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzSellerProduct" (
    "id" SERIAL NOT NULL,
    "productDigiflazzId" INTEGER,
    "sellerId" INTEGER,
    "buyerSkuKode" TEXT,
    "price" INTEGER,
    "sellerProductStatus" BOOLEAN,
    "startCutOff" TIME,
    "endCutOff" TIME,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzSellerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigiflazzTransaction" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER,
    "productDigiflazzId" INTEGER,
    "sellerId" INTEGER,
    "buyerSkuCode" TEXT,
    "status" "TransactionStatus" DEFAULT 'proses',
    "requestTime" TIMESTAMP(3),
    "responseTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigiflazzTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IakPascabayarType" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IakPascabayarType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IakPascabayarProduct" (
    "id" SERIAL NOT NULL,
    "produkPascabayarId" INTEGER,
    "code" TEXT,
    "name" TEXT,
    "status" "ProdukStatus" DEFAULT 'active',
    "fee" INTEGER,
    "komisi" INTEGER,
    "typeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IakPascabayarProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IakPrabayarType" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IakPrabayarType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IakPrabayarOperator" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "typeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IakPrabayarOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IakPrabayarProduk" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER,
    "operatorId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "price" INTEGER,
    "status" "ProdukStatus" DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IakPrabayarProduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripayPrabayarKategori" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripayPrabayarKategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripayPrabayarOperator" (
    "id" SERIAL NOT NULL,
    "kategoriId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripayPrabayarOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripayPrabayarProduk" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER,
    "operatorId" INTEGER,
    "kode" TEXT,
    "name" TEXT,
    "price" INTEGER,
    "deskripsi" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripayPrabayarProduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutationBank" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "bankCode" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "balance" DOUBLE PRECISION,
    "type" "MutationType",
    "amount" INTEGER,
    "description" TEXT,
    "remark" TEXT,
    "bankRef" TEXT,
    "lastBalance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MutationBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "path" TEXT,
    "icon" TEXT,
    "tab" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubMenu" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "name" TEXT,
    "path" TEXT,
    "icon" TEXT,
    "tab" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TabMenu" (
    "id" SERIAL NOT NULL,
    "submenu_id" INTEGER NOT NULL,
    "name" TEXT,
    "icon" TEXT,
    "path" TEXT,
    "desc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TabMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRegister" (
    "id" SERIAL NOT NULL,
    "nomor_tujuan" TEXT,
    "otp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentFeeAgenHistory" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER,
    "kode" TEXT,
    "totalPayment" INTEGER,
    "paymentType" "PaymentType",
    "transaksiPrabayar" INTEGER,
    "transaksiPascabayar" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentFeeAgenHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Member_uuid_key" ON "Member"("uuid");

-- AddForeignKey
ALTER TABLE "BankTransferOutlet" ADD CONSTRAINT "BankTransferOutlet_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefix" ADD CONSTRAINT "Prefix_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukPascabayar" ADD CONSTRAINT "ProdukPascabayar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukPascabayar" ADD CONSTRAINT "ProdukPascabayar_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionPascabayar" ADD CONSTRAINT "TransactionPascabayar_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "ProdukPascabayar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionPascabayar" ADD CONSTRAINT "TransactionPascabayar_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionPascabayar" ADD CONSTRAINT "TransactionPascabayar_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDeposit" ADD CONSTRAINT "RequestDeposit_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDeposit" ADD CONSTRAINT "RequestDeposit_bankTransferId_fkey" FOREIGN KEY ("bankTransferId") REFERENCES "BankTransferOutlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatTransaksi" ADD CONSTRAINT "RiwayatTransaksi_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatMutasi" ADD CONSTRAINT "RiwayatMutasi_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatMutasi" ADD CONSTRAINT "RiwayatMutasi_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmraRentalFee" ADD CONSTRAINT "AmraRentalFee_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferSaldo" ADD CONSTRAINT "TransferSaldo_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerimaSaldo" ADD CONSTRAINT "TerimaSaldo_riwayatTransaksiId_fkey" FOREIGN KEY ("riwayatTransaksiId") REFERENCES "RiwayatTransaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifMemberRead" ADD CONSTRAINT "NotifMemberRead_notifId_fkey" FOREIGN KEY ("notifId") REFERENCES "Notif"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifMemberRead" ADD CONSTRAINT "NotifMemberRead_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResetPassword" ADD CONSTRAINT "ResetPassword_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzProduct" ADD CONSTRAINT "DigiflazzProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DigiflazzCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzProduct" ADD CONSTRAINT "DigiflazzProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "DigiflazzBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzProduct" ADD CONSTRAINT "DigiflazzProduct_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DigiflazzType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzProduct" ADD CONSTRAINT "DigiflazzProduct_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzSellerProduct" ADD CONSTRAINT "DigiflazzSellerProduct_productDigiflazzId_fkey" FOREIGN KEY ("productDigiflazzId") REFERENCES "DigiflazzProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzSellerProduct" ADD CONSTRAINT "DigiflazzSellerProduct_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "DigiflazzSeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzTransaction" ADD CONSTRAINT "DigiflazzTransaction_productDigiflazzId_fkey" FOREIGN KEY ("productDigiflazzId") REFERENCES "DigiflazzProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzTransaction" ADD CONSTRAINT "DigiflazzTransaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "DigiflazzSeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigiflazzTransaction" ADD CONSTRAINT "DigiflazzTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IakPascabayarProduct" ADD CONSTRAINT "IakPascabayarProduct_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "IakPascabayarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IakPascabayarProduct" ADD CONSTRAINT "IakPascabayarProduct_produkPascabayarId_fkey" FOREIGN KEY ("produkPascabayarId") REFERENCES "ProdukPascabayar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IakPrabayarOperator" ADD CONSTRAINT "IakPrabayarOperator_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "IakPrabayarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IakPrabayarProduk" ADD CONSTRAINT "IakPrabayarProduk_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "IakPrabayarOperator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IakPrabayarProduk" ADD CONSTRAINT "IakPrabayarProduk_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripayPrabayarOperator" ADD CONSTRAINT "TripayPrabayarOperator_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "TripayPrabayarKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripayPrabayarProduk" ADD CONSTRAINT "TripayPrabayarProduk_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "TripayPrabayarOperator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripayPrabayarProduk" ADD CONSTRAINT "TripayPrabayarProduk_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubMenu" ADD CONSTRAINT "SubMenu_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabMenu" ADD CONSTRAINT "TabMenu_submenu_id_fkey" FOREIGN KEY ("submenu_id") REFERENCES "SubMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentFeeAgenHistory" ADD CONSTRAINT "PaymentFeeAgenHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
