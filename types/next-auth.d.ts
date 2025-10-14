import { DefaultSession } from "next-auth";
import { Role, Country } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      country: Country;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    country: Country;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    country: Country;
  }
}
