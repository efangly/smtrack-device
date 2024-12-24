-- CreateEnum
CREATE TYPE "Day" AS ENUM ('OFF', 'ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateTable
CREATE TABLE "Devices" (
    "id" VARCHAR(40) NOT NULL,
    "ward" VARCHAR(100) NOT NULL DEFAULT 'WID-DEVELOPMENT',
    "hospital" VARCHAR(100) NOT NULL DEFAULT 'HID-DEVELOPMENT',
    "staticName" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT false,
    "seq" SERIAL NOT NULL,
    "location" VARCHAR(255),
    "position" VARCHAR(255),
    "positionPic" VARCHAR(255),
    "installDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "firmware" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "remark" VARCHAR(255),
    "online" BOOLEAN NOT NULL DEFAULT false,
    "tag" VARCHAR(100),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Probes" (
    "id" VARCHAR(100) NOT NULL,
    "sn" VARCHAR(40) NOT NULL,
    "name" VARCHAR(255),
    "type" VARCHAR(50),
    "channel" CHAR(1) NOT NULL DEFAULT '1',
    "tempMin" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tempMax" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiMin" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiMax" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tempAdj" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "humiAdj" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "stampTime" VARCHAR(50),
    "doorQty" SMALLINT NOT NULL DEFAULT 1,
    "position" VARCHAR(250),
    "muteAlarmDuration" VARCHAR(50),
    "doorSound" BOOLEAN NOT NULL DEFAULT true,
    "doorAlarmTime" VARCHAR(3),
    "muteDoorAlarmDuration" VARCHAR(50),
    "notiDelay" SMALLINT NOT NULL DEFAULT 0,
    "notiToNormal" BOOLEAN NOT NULL DEFAULT true,
    "notiMobile" BOOLEAN NOT NULL DEFAULT true,
    "notiRepeat" SMALLINT NOT NULL DEFAULT 1,
    "firstDay" "Day" NOT NULL DEFAULT 'OFF',
    "secondDay" "Day" NOT NULL DEFAULT 'OFF',
    "thirdDay" "Day" NOT NULL DEFAULT 'OFF',
    "firstTime" VARCHAR(4) DEFAULT '0000',
    "secondTime" VARCHAR(4) DEFAULT '0000',
    "thirdTime" VARCHAR(4) DEFAULT '0000',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Probes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configs" (
    "id" VARCHAR(100) NOT NULL,
    "sn" VARCHAR(100) NOT NULL,
    "dhcp" BOOLEAN NOT NULL DEFAULT true,
    "ip" VARCHAR(50),
    "mac" VARCHAR(20),
    "subnet" VARCHAR(50),
    "gateway" VARCHAR(50),
    "dns" VARCHAR(50),
    "dhcpEth" VARCHAR(50),
    "ipEth" VARCHAR(50),
    "macEth" VARCHAR(20),
    "subnetEth" VARCHAR(50),
    "gatewayEth" VARCHAR(50),
    "dnsEth" VARCHAR(50),
    "ssid" VARCHAR(50) DEFAULT 'RDE2_2.4GHz',
    "password" VARCHAR(50) DEFAULT 'rde05012566',
    "simSP" VARCHAR(100),
    "email1" VARCHAR(200),
    "email2" VARCHAR(200),
    "email3" VARCHAR(200),
    "hardReset" VARCHAR(4) DEFAULT '0200',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repairs" (
    "id" VARCHAR(100) NOT NULL,
    "seq" SERIAL NOT NULL,
    "devName" VARCHAR(100) NOT NULL,
    "info" VARCHAR(155),
    "info1" VARCHAR(155),
    "info2" VARCHAR(155),
    "address" VARCHAR(155),
    "ward" VARCHAR(155),
    "detail" VARCHAR(155),
    "phone" VARCHAR(20),
    "status" VARCHAR(155),
    "warrantyStatus" VARCHAR(30),
    "remark" VARCHAR(155),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranties" (
    "id" VARCHAR(100) NOT NULL,
    "devName" VARCHAR(100) NOT NULL,
    "product" VARCHAR(255),
    "model" VARCHAR(255),
    "installDate" VARCHAR(255),
    "customerName" VARCHAR(255),
    "customerAddress" VARCHAR(500),
    "saleDepartment" VARCHAR(100),
    "invoice" VARCHAR(50),
    "expire" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogDays" (
    "id" VARCHAR(100) NOT NULL,
    "serial" VARCHAR(100) NOT NULL,
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
    "probe" VARCHAR(10) NOT NULL DEFAULT '1',
    "battery" SMALLINT NOT NULL DEFAULT 0,
    "tempInternal" DOUBLE PRECISION DEFAULT 0.00,
    "extMemory" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogDays_pkey" PRIMARY KEY ("id")
);

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
