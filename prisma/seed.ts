import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding PostgreSQL database with default users...');

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoPasswordHash = await bcrypt.hash('1234', 10);

  const demoUsers = [
    {
      id: 'usr-smsmoe006',
      email: 'smsmoe006@enterprise.io',
      username: 'SMSMOE006',
      studentId: 'STU006',
      employeeId: 'EMP006',
      fullName: 'SMSMOE006 (Demo Lead)',
      role: Role.ADMIN,
      passwordHash: demoPasswordHash,
    },
    {
      id: 'usr-1',
      email: 'architect@enterprise.io',
      username: 'architect99',
      studentId: 'STU98765',
      employeeId: 'EMP102',
      fullName: 'Alex Architect (Multi-Id Lead)',
      role: Role.ADMIN,
      passwordHash,
    },
    {
      id: 'usr-2',
      email: 'student@university.edu',
      username: 'jordan_student',
      studentId: 'STU54321',
      fullName: 'Jordan Miller (Graduate Student)',
      role: Role.STUDENT,
      passwordHash,
    },
    {
      id: 'usr-3',
      email: 'employee@company.com',
      username: 'taylor_dev',
      employeeId: 'EMP808',
      fullName: 'Taylor Vance (Senior Engineer)',
      role: Role.EMPLOYEE,
      passwordHash,
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        username: user.username,
        studentId: user.studentId,
        employeeId: user.employeeId,
        fullName: user.fullName,
        role: user.role,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
  }

  console.log('Database seeded successfully.');
}

if (process.env.NODE_ENV !== 'test') {
  main()
    .catch((e) => {
      console.error('Error seeding database:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
