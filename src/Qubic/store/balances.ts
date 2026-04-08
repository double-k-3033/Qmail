import { atom } from "jotai";

export interface Balance {
  publicId: string;
  amount: number;
}

export const balancesAtom = atom<Balance[]>([]);
