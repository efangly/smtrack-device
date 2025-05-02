import { Prisma } from "@prisma/client";

export const probeWithPosts = Prisma.validator<Prisma.ProbesDefaultArgs>()({
  include: { device: { include: { log: true } } },
});

export type ProbeWithPosts = Prisma.ProbesGetPayload<typeof probeWithPosts>;