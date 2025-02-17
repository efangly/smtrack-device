-- CreateEnum
CREATE TYPE "Day" AS ENUM ('OFF', 'ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateTable
CREATE TABLE "Devices" (
    "deviceId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ward" TEXT NOT NULL DEFAULT 'WID-DEVELOPMENT',
    "hospital" TEXT NOT NULL DEFAULT 'HID-DEVELOPMENT',
    "staticName" TEXT NOT NULL,
    "name" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "seq" INTEGER NOT NULL,
    "location" TEXT,
    "position" TEXT,
    "positionPic" TEXT,
    "installDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "firmware" TEXT NOT NULL DEFAULT '1.0.0',
    "remark" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "tag" TEXT,
    "token" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devices_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "Probes" (
    "id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "channel" TEXT NOT NULL DEFAULT '1',
    "tempMin" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tempMax" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiMin" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiMax" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tempAdj" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiAdj" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "stampTime" TEXT,
    "doorQty" INTEGER NOT NULL DEFAULT 1,
    "position" TEXT,
    "muteAlarmDuration" TEXT,
    "doorSound" BOOLEAN NOT NULL DEFAULT true,
    "doorAlarmTime" TEXT,
    "muteDoorAlarmDuration" TEXT,
    "notiDelay" INTEGER NOT NULL DEFAULT 0,
    "notiToNormal" BOOLEAN NOT NULL DEFAULT true,
    "notiMobile" BOOLEAN NOT NULL DEFAULT true,
    "notiRepeat" INTEGER NOT NULL DEFAULT 1,
    "firstDay" "Day" NOT NULL DEFAULT 'OFF',
    "secondDay" "Day" NOT NULL DEFAULT 'OFF',
    "thirdDay" "Day" NOT NULL DEFAULT 'OFF',
    "firstTime" TEXT DEFAULT '0000',
    "secondTime" TEXT DEFAULT '0000',
    "thirdTime" TEXT DEFAULT '0000',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Probes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configs" (
    "id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "dhcp" BOOLEAN NOT NULL DEFAULT true,
    "ip" TEXT,
    "mac" TEXT,
    "subnet" TEXT,
    "gateway" TEXT,
    "dns" TEXT,
    "dhcpEth" BOOLEAN DEFAULT true,
    "ipEth" TEXT,
    "macEth" TEXT,
    "subnetEth" TEXT,
    "gatewayEth" TEXT,
    "dnsEth" TEXT,
    "ssid" TEXT DEFAULT 'RDE3_2.4GHz',
    "password" TEXT DEFAULT 'rde05012566',
    "simSP" TEXT,
    "email1" TEXT,
    "email2" TEXT,
    "email3" TEXT,
    "hardReset" TEXT DEFAULT '0200',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repairs" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "devName" TEXT NOT NULL,
    "info" TEXT,
    "info1" TEXT,
    "info2" TEXT,
    "address" TEXT,
    "ward" TEXT,
    "detail" TEXT,
    "phone" TEXT,
    "status" TEXT,
    "warrantyStatus" TEXT,
    "remark" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranties" (
    "id" TEXT NOT NULL,
    "devName" TEXT NOT NULL,
    "product" TEXT,
    "model" TEXT,
    "installDate" TEXT,
    "customerName" TEXT,
    "customerAddress" TEXT,
    "saleDepartment" TEXT,
    "invoice" TEXT,
    "expire" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogDays" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tempDisplay" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humidity" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humidityDisplay" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "sendTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plug" BOOLEAN NOT NULL DEFAULT false,
    "door1" BOOLEAN NOT NULL DEFAULT false,
    "door2" BOOLEAN NOT NULL DEFAULT false,
    "door3" BOOLEAN NOT NULL DEFAULT false,
    "internet" BOOLEAN NOT NULL DEFAULT false,
    "probe" TEXT NOT NULL DEFAULT '1',
    "battery" INTEGER NOT NULL DEFAULT 0,
    "tempInternal" DOUBLE PRECISION DEFAULT 0.00,
    "extMemory" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogDays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Devices_id_key" ON "Devices"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Devices_staticName_key" ON "Devices"("staticName");

-- CreateIndex
CREATE UNIQUE INDEX "Devices_seq_key" ON "Devices"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "Configs_sn_key" ON "Configs"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Repairs_seq_key" ON "Repairs"("seq");

-- AddForeignKey
ALTER TABLE "Probes" ADD CONSTRAINT "Probes_sn_fkey" FOREIGN KEY ("sn") REFERENCES "Devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configs" ADD CONSTRAINT "Configs_sn_fkey" FOREIGN KEY ("sn") REFERENCES "Devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repairs" ADD CONSTRAINT "Repairs_devName_fkey" FOREIGN KEY ("devName") REFERENCES "Devices"("staticName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranties" ADD CONSTRAINT "Warranties_devName_fkey" FOREIGN KEY ("devName") REFERENCES "Devices"("staticName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogDays" ADD CONSTRAINT "LogDays_serial_fkey" FOREIGN KEY ("serial") REFERENCES "Devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
