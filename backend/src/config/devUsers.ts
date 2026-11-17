/** Test accounts used by POST /api/auth/dev-login and `npm run seed:dev`. Development only. */
export const DEV_USERS = {
  student: { name: "Dev Student", email: "student@cadence.dev", phone: "9000000001", phoneVerified: true, role: "student" },
  admin: { name: "Dev Admin", email: "admin@cadence.dev", phoneVerified: false, role: "admin" },
  unverified: { name: "Dev Newbie", email: "new@cadence.dev", phoneVerified: false, role: "student" },
} as const;

export type DevPersona = keyof typeof DEV_USERS;
