import { Recipe } from "./Recipe";
export interface Menu {
  id: number;
  name: string;
  days: number;
  description?: string;
  plan: { [meal: string]: Recipe | null }[];
}
