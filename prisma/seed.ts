import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const title = "KAB-1: Quadro Kanban inicial";

  const existing = await prisma.card.findFirst({ where: { title } });
  if (existing) {
    console.log("Card KAB-1 já existe, nada a fazer.");
    return;
  }

  await prisma.card.create({
    data: {
      title,
      description:
        "Visualizar um quadro Kanban com as colunas To Do, Doing, Testing e Done, com botão para adicionar cards (título, descrição, data de criação, previsão de conclusão, esforço e owners).",
      column: "DONE",
      effort: "LARGE",
      owners: "Marcelo",
      dueDate: new Date(),
    },
  });

  console.log("Card KAB-1 criado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
