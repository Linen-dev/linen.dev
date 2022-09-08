import prisma from '../../client';

export async function truncateTables() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

export async function deleteData() {
  const models = (prisma as any)._dmmf.datamodel.models.map(
    ({ name }: { name: string }) => name
  );
  await prisma.$transaction(
    models.map((name: string) => (prisma as any)[name].deleteMany({}))
  );
}
