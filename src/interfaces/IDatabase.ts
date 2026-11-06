import { Appointment } from "../models/Appointment";
import { Pet } from "../models/Pet";
import { PetOwner } from "../models/PetOwner";
import { Veterinarian } from "../models/Veterinarian";
import { ExamType } from "../models/enums/ExamTypeEnums";
import { Status } from "../models/enums/StatusEnums";

export interface IDatabase {
  createOwner(owner: PetOwner): void;

  createVeterinarian(veterinarian: Veterinarian): void;

  createAppointment(appointment: Appointment): void;

  createPet(pet: Pet): void;

  getOwners(): PetOwner[];

  getVeterinarians(): Veterinarian[];

  getPets(): Pet[];

  getAppointments(): Appointment[];

  getAppointmentsByStatus(status: Status): Appointment[];

  getExams(): ExamType[];

  getOwnerById(id: number): PetOwner;

  getVeterinarianById(id: number): Veterinarian;

  getPetById(id: number): Pet;

  getAppointmentById(id: number): Appointment;

  getPetsByOwnerId(id: number): Pet[];

  findPetsByDiagnosis(keyword: string): Pet[];

  findVetByCrmv(crmv: string): Veterinarian | undefined;

  findOwnerByEmail(email: string): PetOwner | undefined;

  findOwnerByCpf(cpf: string): PetOwner | undefined;

  cpfExists(cpf: string): boolean;

  emailExists(email: string): boolean;

  crmvExists(crmv: string): boolean;

  finishAppointment(id: number, diagnosis: string): void;

  cancelAppointment(id: number): void;
}
