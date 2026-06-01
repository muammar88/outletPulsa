-- CreateTable
CREATE TABLE "PengaturanUmum" (
    "id" SERIAL NOT NULL,
    "nama_aplikasi" TEXT DEFAULT 'Outlet Pulsa',
    "deskripsi" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "telepon" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengaturanUmum_pkey" PRIMARY KEY ("id")
);
