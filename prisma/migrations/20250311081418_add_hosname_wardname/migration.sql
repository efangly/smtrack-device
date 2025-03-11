-- AlterTable
ALTER TABLE "Devices" ADD COLUMN     "hospitalName" TEXT DEFAULT 'HOSPITAL-DEV',
ADD COLUMN     "wardName" TEXT DEFAULT 'WARD-DEV';
