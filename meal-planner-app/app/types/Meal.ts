export interface Meal {
  id: string;       // Your backend returns '25306' as a string, not number
  menuid: number;   // 'menuid' (lowercase 'm')
  dayindex: number; // 'dayindex' (lowercase 'd')
  mealtype: string; // 'mealtype' (lowercase 'm')
}