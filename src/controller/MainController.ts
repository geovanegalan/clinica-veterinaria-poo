import { PetSearch } from "../interfaces/PetSearch";
import { PetOwner } from "../models/PetOwner";
import { IDatabase } from "../interfaces/IDatabase";
import { Veterinarian } from "../models/Veterinarian";
import { Pet } from "../models/Pet";
import { ExamType } from "../models/enums/ExamTypeEnums";
import { Appointment } from "../models/Appointment";
import { Status } from "../models/enums/StatusEnums";
import { sortList } from "../utils/sort";
import { User } from "../models/User";
import {
  AppointmentNotFound,
  DuplicateDataError,
  EntityNotFoundError,
  MissingDiagnosisError,
  NoVeterinariansError,
  OwnerHasNoPetsError,
} from "../errors/Errors";

export class MainController {
  constructor(private database: IDatabase) {}

  public createPetOwner(name: string, email: string, cpf: string): void {
    if (this.database.emailExists(email)) {
      throw new DuplicateDataError("email", email);
    }
    if (this.database.cpfExists(cpf)) {
      throw new DuplicateDataError("cpf", cpf);
    }

    const newOwner = new PetOwner(name, cpf, email);
    this.database.createOwner(newOwner);
  }

  public createVeterinarian(name: string, email: string, cpf: string, crmv: string): void {
    if (this.database.emailExists(email)) {
      throw new DuplicateDataError("email", email);
    }

    if (this.database.cpfExists(cpf)) {
      throw new DuplicateDataError("cpf", cpf);
    }

    if (this.database.crmvExists(crmv)) {
      throw new DuplicateDataError("crmv", crmv);
    }

    const newVeterinarian = new Veterinarian(name, cpf, email, crmv);
    this.database.createVeterinarian(newVeterinarian);
  }

  public getOwners(): PetOwner[] {
    const owners = this.database.getOwners();
    return sortList(owners, (a, b) => a.getName().localeCompare(b.getName()));
  }

  public getVeterinarians(): Veterinarian[] {
    const vets = this.database.getVeterinarians();
    return sortList(vets, (a, b) => a.getName().localeCompare(b.getName()));
  }

  public getVeterinariansForAppointment(): Veterinarian[] {
    const veterinarians = this.getVeterinarians();
    if (veterinarians.length === 0) throw new NoVeterinariansError();
    return veterinarians;
  }

  public getAllUsers(): User[] {
    const users = [...this.database.getOwners(), ...this.database.getVeterinarians()];
    return sortList(users, (a, b) => a.getName().localeCompare(b.getName()));
  }

  createPet(name: string, specie: string, age: number, ownercpf: string): void;
  createPet(name: string, specie: string, age: number, ownercpf: string, history: string): void;

  public createPet(name: string, specie: string, age: number, ownercpf: string, history?: string) {
    const owner = this.database.findOwnerByCpf(ownercpf);
    if (!owner) {
      throw new EntityNotFoundError(ownercpf);
    }
    const newPet = new Pet(owner, name, specie, age, history);

    this.database.createPet(newPet);
  }

  public getPetsOwnerByCpf(cpf: string): Pet[] {
    const owner = this.database.findOwnerByCpf(cpf);
    if (!owner) throw new EntityNotFoundError(cpf);

    const pets = this.database.getPetsByOwnerId(owner.getId()!);
    if (pets.length === 0) throw new OwnerHasNoPetsError(owner.getName());

    return pets;
  }

  public createAppointment(exam: ExamType, date: string, pet: Pet, veterinarian: Veterinarian): void {
    const newAppointment = new Appointment(exam, date, pet, veterinarian);
    this.database.createAppointment(newAppointment);
  }

  public getExams(): ExamType[] {
    return this.database.getExams();
  }

  public getPets(): Pet[] {
    const pets = this.database.getPets();
    return sortList(pets, (a, b) => a.getName().localeCompare(b.getName()));
  }

  public getAppointments(): Appointment[] {
    const appointments = this.database.getAppointments();
    return sortList(appointments, (a, b) => a.getExamType().localeCompare(b.getExamType()));
  }

  public getAppointmentsByStatus(status: Status): Appointment[] {
    const appointments = this.database.getAppointmentsByStatus(status);
    return sortList(appointments, (a, b) => a.getExamType().localeCompare(b.getExamType()));
  }

  public findPets(search: PetSearch): Pet[] {
    const specie = search.specie?.trim();
    if (search.diagnosis !== undefined) {
      const diagnosis = search.diagnosis.trim();
      if (!diagnosis) return [];
      return sortList(this.database.findPets({ ...(specie ? { specie } : {}), diagnosis: diagnosis.toLowerCase() }),
        (a, b) => a.getName().localeCompare(b.getName()));
    }
    return sortList(this.database.findPets({ ...(specie ? { specie } : {}), examType: search.examType }),
      (a, b) => a.getName().localeCompare(b.getName()));
  }

  public getAppointmentById(id: number): Appointment {
    const appointment = this.database.getAppointmentById(id);
    if (!appointment) throw new AppointmentNotFound(id);
    return appointment;
  }

  public finishAppointment(id: number, diagnosis: string): void {
    if (!diagnosis || diagnosis.trim().length === 0) {
      throw new MissingDiagnosisError(this.getAppointmentById(id));
    }
    this.database.finishAppointment(id, diagnosis);
  }

  public cancelAppointment(id: number): void {
    this.database.cancelAppointment(id);
  }
}
