import bcrypt from "bcrypt";

export const hashCode = async (code: string) => await bcrypt.hash(code, 10);