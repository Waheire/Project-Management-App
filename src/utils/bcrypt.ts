import bcrypt from "bcrypt"

export const hashValue = async (value: string, slatRounds: number = 10) =>
    await bcrypt.hash(value, slatRounds);

export const compareValue = async (value: string, hashedValue: string) =>
    await bcrypt.compare(value, hashedValue);