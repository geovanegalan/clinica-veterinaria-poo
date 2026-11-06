import { ExamType } from "../models/enums/ExamTypeEnums";

export type PetSearch =
  | { specie?: string; diagnosis: string; examType?: never }
  | { specie?: string; examType: ExamType; diagnosis?: never };
