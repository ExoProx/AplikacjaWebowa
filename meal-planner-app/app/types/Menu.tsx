import { Recipe } from "./Recipe";
export interface Menu {
  id: number;
  name: string;
  days: number;
  plan: { [meal: string]: Recipe | null }[];
}
