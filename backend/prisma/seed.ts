import { PrismaClient, Role, SkillKind, SkillLevel, SlotStatus, OpenRequestStatus, BookingStatus, SessionStatus, FriendshipStatus, ChannelType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Senha padrão pra todos os usuários de teste — facilita login manual durante o desenvolvimento
const DEFAULT_PASSWORD = "Teste123!";

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("Limpando dados antigos...");

  // Ordem inversa às dependências, pra não violar foreign key
  await prisma.chatMessage.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.openRequest.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  console.log("Criando usuários...");

  // ---- 1. Marlon — aluno, estudando React/Node, sem skills de ensino ----
  const marlon = await prisma.user.create({
    data: {
      name: "Marlon Alves",
      email: "marlon@duo.dev",
      password: passwordHash,
      role: Role.USER,
      avatar: "https://i.pravatar.cc/150?u=marlon",
      profile: {
        create: {
          bio: "Estudante de ADS em desenvolvimento, focado em virar Full Stack Developer.",
          studyPreferences: ["Noturno", "Fins de semana"],
          contentToStudy: "React, Node.js, algoritmos",
          contentToTeach: null,
          lessonsStudied: 3,
          progress: 0.3,
          matchCount: 2,
          lastMatchAt: new Date(),
        },
      },
      skills: {
        create: [
          { name: "React", kind: SkillKind.STUDY, level: SkillLevel.INICIANTE },
          { name: "Node.js", kind: SkillKind.STUDY, level: SkillLevel.INTERMEDIARIO },
          { name: "Algoritmos", kind: SkillKind.STUDY, level: SkillLevel.INICIANTE },
        ],
      },
    },
  });

  // ---- 2. João Paulo — mentor de Node.js/JS, com slot e histórico de aulas ----
  const joaoPaulo = await prisma.user.create({
    data: {
      name: "João Paulo",
      email: "joaopaulo@duo.dev",
      password: passwordHash,
      role: Role.PROFESSOR,
      avatar: "https://i.pravatar.cc/150?u=joaopaulo",
      avgRating: 4.8,
      ratingsCount: 12,
      profile: {
        create: {
          bio: "Backend developer há 5 anos, apaixonado por ensinar Node.js e arquitetura de APIs.",
          studyPreferences: [],
          contentToTeach: "Node.js, Express, arquitetura de APIs",
          lessonsMentored: 12,
          progress: 0,
          matchCount: 8,
        },
      },
      skills: {
        create: [
          { name: "Node.js", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
          { name: "JavaScript", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
          { name: "Express", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
        ],
      },
    },
  });

  // ---- 3. Ana Clara — mentora de Matemática/Física ----
  const anaClara = await prisma.user.create({
    data: {
      name: "Ana Clara",
      email: "anaclara@duo.dev",
      password: passwordHash,
      role: Role.PROFESSOR,
      avatar: "https://i.pravatar.cc/150?u=anaclara",
      avgRating: 4.9,
      ratingsCount: 20,
      profile: {
        create: {
          bio: "Mentora de Matemática e Física, gosto de simplificar conceitos complexos.",
          studyPreferences: [],
          contentToTeach: "Matemática, Física, preparação para vestibular",
          lessonsMentored: 20,
          progress: 0,
          matchCount: 15,
        },
      },
      skills: {
        create: [
          { name: "Matemática", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
          { name: "Física", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
        ],
      },
    },
  });

  // ---- 4. Josué Pereira — mentor de Inglês, e também aluno de SQL ----
  const josue = await prisma.user.create({
    data: {
      name: "Josué Pereira",
      email: "josue@duo.dev",
      password: passwordHash,
      role: Role.PROFESSOR,
      avatar: "https://i.pravatar.cc/150?u=josue",
      avgRating: 4.6,
      ratingsCount: 7,
      profile: {
        create: {
          bio: "Professor de inglês e conversação. Aprendendo SQL nas horas livres.",
          studyPreferences: ["Manhã"],
          contentToStudy: "SQL, modelagem de dados",
          contentToTeach: "Inglês, conversação",
          lessonsMentored: 7,
          lessonsStudied: 1,
          progress: 0.1,
          matchCount: 5,
        },
      },
      skills: {
        create: [
          { name: "Inglês", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO },
          { name: "Conversação", kind: SkillKind.TEACH, level: SkillLevel.INTERMEDIARIO },
          { name: "SQL", kind: SkillKind.STUDY, level: SkillLevel.INICIANTE },
        ],
      },
    },
  });

  // ---- 5. Pascoal — mentor de algoritmos, já deu aula pro Marlon ----
  const pascoal = await prisma.user.create({
    data: {
      name: "Pascoal",
      email: "pascoal@duo.dev",
      password: passwordHash,
      role: Role.PROFESSOR,
      avatar: "https://i.pravatar.cc/150?u=pascoal",
      avgRating: 4.7,
      ratingsCount: 9,
      profile: {
        create: {
          bio: "Mentor de algoritmos e técnicas de resolução de problemas.",
          studyPreferences: [],
          contentToTeach: "Algoritmos, técnicas de programação",
          lessonsMentored: 9,
          progress: 0,
          matchCount: 6,
        },
      },
      skills: {
        create: [{ name: "Algoritmos", kind: SkillKind.TEACH, level: SkillLevel.AVANCADO }],
      },
    },
  });

  // ---- 6. Cassierra — aluna nova, ainda sem sessões concluídas ----
  const cassierra = await prisma.user.create({
    data: {
      name: "Cassierra",
      email: "cassierra@duo.dev",
      password: passwordHash,
      role: Role.USER,
      avatar: "https://i.pravatar.cc/150?u=cassierra",
      profile: {
        create: {
          bio: "Começando agora no DUO, buscando aprender React.",
          studyPreferences: ["Tarde"],
          contentToStudy: "React, CSS",
          lessonsStudied: 0,
          progress: 0,
          matchCount: 0,
        },
      },
      skills: {
        create: [
          { name: "React", kind: SkillKind.STUDY, level: SkillLevel.INICIANTE },
          { name: "CSS", kind: SkillKind.STUDY, level: SkillLevel.INICIANTE },
        ],
      },
    },
  });

  console.log("Criando slots de disponibilidade...");

  // Slot aberto do João Paulo — ainda não reservado
  const slotJoaoAberto = await prisma.availabilitySlot.create({
    data: {
      mentorId: joaoPaulo.id,
      skill: "Node.js",
      level: SkillLevel.INTERMEDIARIO,
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // amanhã
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 25),
      status: SlotStatus.OPEN,
      notes: "Aula focada em autenticação JWT",
    },
  });

  // Slot da Ana Clara — também aberto
  await prisma.availabilitySlot.create({
    data: {
      mentorId: anaClara.id,
      skill: "Matemática",
      level: SkillLevel.INTERMEDIARIO,
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 13),
      status: SlotStatus.OPEN,
      notes: "Revisão de funções e derivadas",
    },
  });

  console.log("Criando solicitação aberta...");

  // Cassierra abre uma solicitação pública por React, ainda sem match
  const openRequestCassierra = await prisma.openRequest.create({
    data: {
      creatorId: cassierra.id,
      skill: "React",
      level: SkillLevel.INICIANTE,
      preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
      notes: "Quero entender hooks (useState, useEffect) na prática",
      status: OpenRequestStatus.OPEN,
    },
  });

  console.log("Criando booking concluído (Marlon + Pascoal, algoritmos)...");

  // Booking já concluído: Marlon estudou algoritmos com Pascoal
  const bookingConcluido = await prisma.booking.create({
    data: {
      studentId: marlon.id,
      teacherId: pascoal.id,
      skill: "Algoritmos",
      notes: "Revisão de técnicas de algoritmo para entrevistas",
      status: BookingStatus.COMPLETED,
      scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // há 2 dias
      meetLink: "https://meet.jit.si/duo-marlon-pascoal",
      confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      durationMinutes: 60,
    },
  });

  // Sessão vinculada ao booking concluído
  const sessaoConcluida = await prisma.session.create({
    data: {
      bookingId: bookingConcluido.id,
      status: SessionStatus.COMPLETED,
      meetLink: bookingConcluido.meetLink,
      startedAt: bookingConcluido.scheduledFor!,
      endedAt: new Date(bookingConcluido.scheduledFor!.getTime() + 1000 * 60 * 60),
      durationMinutes: 60,
    },
  });

  // Review do Marlon pro Pascoal, sobre a sessão concluída
  await prisma.review.create({
    data: {
      sessionId: sessaoConcluida.id,
      reviewerId: marlon.id,
      mentorId: pascoal.id,
      rating: 5,
      comment: "Pascoal explicou muito bem, recomendo!",
    },
  });

  console.log("Criando booking pendente (Marlon + João Paulo, vinculado ao slot)...");

  // Booking pendente, vinculado ao slot aberto do João Paulo (próxima aula do Marlon)
  const bookingPendente = await prisma.booking.create({
    data: {
      studentId: marlon.id,
      teacherId: joaoPaulo.id,
      skill: "Node.js",
      notes: "Quero revisar autenticação antes da aula",
      status: BookingStatus.CONFIRMED,
      scheduledFor: slotJoaoAberto.startsAt,
      meetLink: "https://meet.jit.si/duo-marlon-joaopaulo",
      confirmedAt: new Date(),
    },
  });

  // Vincula o slot ao booking e marca como reservado
  await prisma.availabilitySlot.update({
    where: { id: slotJoaoAberto.id },
    data: { status: SlotStatus.BOOKED, bookingId: bookingPendente.id },
  });

  // Sessão agendada (ainda não aconteceu)
  await prisma.session.create({
    data: {
      bookingId: bookingPendente.id,
      status: SessionStatus.SCHEDULED,
      meetLink: bookingPendente.meetLink,
    },
  });

  console.log("Criando amizade e canal de chat...");

  // Amizade entre Marlon e João Paulo (já se conhecem de uma sessão anterior)
  const amizade = await prisma.friendship.create({
    data: {
      userAId: marlon.id,
      userBId: joaoPaulo.id,
      status: FriendshipStatus.ACTIVE,
    },
  });

  // Canal de chat vinculado à amizade
  const canalAmizade = await prisma.chatChannel.create({
    data: {
      type: ChannelType.FRIENDSHIP,
      userAId: marlon.id,
      userBId: joaoPaulo.id,
      friendshipId: amizade.id,
    },
  });

  // Mensagens de exemplo no canal
  await prisma.chatMessage.createMany({
    data: [
      {
        channelId: canalAmizade.id,
        senderId: marlon.id,
        body: "Oi João! Tudo certo pra nossa aula de Node.js amanhã às 18h?",
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
        readAt: new Date(Date.now() - 1000 * 60 * 18),
      },
      {
        channelId: canalAmizade.id,
        senderId: joaoPaulo.id,
        body: "Combinado! Vou revisar autenticação JWT antes",
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        readAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        channelId: canalAmizade.id,
        senderId: marlon.id,
        body: "Combinado!",
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        readAt: null, // ainda não lida, pra testar indicador de "não lida"
      },
    ],
  });

  // Canal de chat vinculado ao booking pendente (Marlon + João Paulo), pra testar chat por contexto de sessão
  await prisma.chatChannel.create({
    data: {
      type: ChannelType.BOOKING,
      userAId: marlon.id,
      userBId: joaoPaulo.id,
      bookingId: bookingPendente.id,
    },
  });

  console.log("\nSeed concluído com sucesso!\n");
  console.log("Usuários criados (todos com a senha: " + DEFAULT_PASSWORD + "):");
  console.log("  - marlon@duo.dev      (aluno)");
  console.log("  - joaopaulo@duo.dev   (mentor Node.js)");
  console.log("  - anaclara@duo.dev    (mentora Matemática/Física)");
  console.log("  - josue@duo.dev       (mentor Inglês, aluno de SQL)");
  console.log("  - pascoal@duo.dev     (mentor Algoritmos)");
  console.log("  - cassierra@duo.dev   (aluna nova, sem histórico)");
  console.log("\nCobertura: profiles, skills, slots, open_requests, bookings,");
  console.log("sessions, reviews, friendships, chat_channels, chat_messages.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });