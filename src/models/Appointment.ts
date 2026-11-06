import { ExamType } from "./enums/ExamTypeEnums";
import { Status } from "./enums/StatusEnums";
import { Pet } from "./Pet";
import { Veterinarian } from "./Veterinarian";

export class Appointment {
  private id?: number;
  private status: Status = Status.Scheduled;
  private examType: ExamType;
  private date: string;
  private diagnosis: string = "";
  private pet: Pet;
  private veterinarian: Veterinarian;

  public constructor(examType: ExamType, date: string, pet: Pet, veterinarian: Veterinarian) {
    this.examType = examType;
    this.date = date;
    this.pet = pet;
    this.veterinarian = veterinarian;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getStatus(): Status {
    return this.status;
  }

  public setStatus(status: Status): void {
    this.status = status;
  }

  public getExamType(): ExamType {
    return this.examType;
  }

  public setExamType(examType: ExamType): void {
    this.examType = examType;
  }

  public getDate(): string {
    return this.date;
  }

  public setDate(date: string): void {
    this.date = date;
  }

  public getDiagnosis(): string | undefined {
    return this.diagnosis;
  }

  public setDiagnosis(diagnosis: string): void {
    this.diagnosis = diagnosis;
  }

  public getPet(): Pet {
    return this.pet;
  }

  public setPet(pet: Pet): void {
    this.pet = pet;
  }

  public getVeterinarian(): Veterinarian {
    return this.veterinarian;
  }

  public setVeterinarian(veterinarian: Veterinarian): void {
    this.veterinarian = veterinarian;
  }

  public showDataAppointment(): string {
    return `-----------------------------------\nProtocolo: ${this.getId()}\nStatus: ${this.getStatus()}\nPaciente: ${this.getPet().getName()}\nData: ${this.getDate()}\nExame: ${this.getExamType()}\nMédico Veterinário: ${this.getVeterinarian().getName()} - CRMV ${this.getVeterinarian().getCrmv()}\nDiagnóstico: ${this.getDiagnosis()}`;
  }
}
