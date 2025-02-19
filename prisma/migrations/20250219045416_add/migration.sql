-- AlterTable
CREATE SEQUENCE repairs_seq_seq;
ALTER TABLE "Repairs" ALTER COLUMN "seq" SET DEFAULT nextval('repairs_seq_seq');
ALTER SEQUENCE repairs_seq_seq OWNED BY "Repairs"."seq";
