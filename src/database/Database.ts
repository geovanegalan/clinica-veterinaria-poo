import { PetSearch } from "../interfaces/PetSearch";
import { DatabaseSync } from "node:sqlite";
import { PetOwner } from "../models/PetOwner";
import { Veterinarian } from "../models/Veterinarian";
import { Pet } from "../models/Pet";
import { Appointment } from "../models/Appointment";
import { IDatabase } from "../interfaces/IDatabase";
import { ExamType } from "../models/enums/ExamTypeEnums";
import { DatabaseErrorNoId, EntityNotFoundError } from "../errors/Errors";
import { Status } from "../models/enums/StatusEnums";

export class Database implements IDatabase {
  private db: DatabaseSync;

  constructor(path: string = "./database/clinica.db") {
    this.db = new DatabaseSync(path);

    this.db.exec(`CREATE TABLE IF NOT EXISTS veterinarians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    crmv TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pet_owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    specie TEXT NOT NULL,
    age INTEGER NOT NULL,
    history TEXT,

    FOREIGN KEY (pet_owner_id)
        REFERENCES pet_owners(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT 'AGENDADO',
    exam_type TEXT NOT NULL,
    date TEXT NOT NULL,
    diagnosis TEXT NOT NULL DEFAULT '',
    pet_id INTEGER NOT NULL,
    veterinarian_id INTEGER NOT NULL,

    FOREIGN KEY (veterinarian_id) 
        REFERENCES veterinarians(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

    FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);`);
  }

  close(): void {
    this.db.close();
  }

  getExams(): ExamType[] {
    return Object.values(ExamType) as ExamType[];
  }

  createOwner(owner: PetOwner): void {
    const stmt = this.db.prepare(`
        INSERT INTO pet_owners (name, cpf, email)
        VALUES (?, ?, ?);
    `);

    const result = stmt.run(owner.getName(), owner.getCpf(), owner.getEmail());

    owner.setId(Number(result.lastInsertRowid));
  }

  createVeterinarian(veterinarian: Veterinarian): void {
    const stmt = this.db.prepare(`INSERT INTO veterinarians (name, cpf, email, crmv) VALUES(?, ?, ? ,?)`);

    const result = stmt.run(
      veterinarian.getName(),
      veterinarian.getCpf(),
      veterinarian.getEmail(),
      veterinarian.getCrmv(),
    );

    veterinarian.setId(Number(result.lastInsertRowid));
  }

  createPet(pet: Pet): void {
    const stmt = this.db.prepare(`
        INSERT INTO pets (pet_owner_id, name, specie, age, history)
        VALUES (?, ?, ?, ?, ?)
    `);

    const ownerId = pet.getOwner().getId();

    if (ownerId === undefined) {
      throw new DatabaseErrorNoId(pet.getOwner());
    }

    const result = stmt.run(ownerId, pet.getName(), pet.getSpecie(), pet.getAge(), pet.getHistory());

    pet.setId(Number(result.lastInsertRowid));
  }

  createAppointment(appointment: Appointment): void {
    const stmt = this.db.prepare(
      `INSERT INTO appointments(exam_type, date, pet_id, veterinarian_id) VALUES(?, ?, ?, ?)`,
    );

    const petId = appointment.getPet().getId();
    if (petId === undefined) throw new DatabaseErrorNoId(appointment.getPet());

    const vetId = appointment.getVeterinarian().getId();
    if (vetId === undefined) throw new DatabaseErrorNoId(appointment.getVeterinarian());

    const result = stmt.run(appointment.getExamType(), appointment.getDate(), petId, vetId);

    appointment.setId(Number(result.lastInsertRowid));
  }

  getVeterinarianById(id: number): Veterinarian {
    const stmt = this.db.prepare(`
        SELECT *
        FROM veterinarians
        WHERE id = ?
        LIMIT 1
    `);

    const row = stmt.get(id);

    if (!row) {
      throw new EntityNotFoundError(id);
    }

    const veterinarian = new Veterinarian(
      row.name as string,
      row.cpf as string,
      row.email as string,
      row.crmv as string,
    );

    veterinarian.setId(row.id as number);

    return veterinarian;
  }

  getVeterinarians(): Veterinarian[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM veterinarians
    `);

    const rows = stmt.all();

    return rows.map((row) => {
      const veterinarian = new Veterinarian(
        row.name as string,
        row.cpf as string,
        row.email as string,
        row.crmv as string,
      );

      veterinarian.setId(row.id as number);

      return veterinarian;
    });
  }

  getOwnerById(id: number): PetOwner {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pet_owners
        WHERE id = ?
        LIMIT 1
    `);

    const row = stmt.get(id);

    if (!row) {
      throw new EntityNotFoundError(id);
    }

    const owner = new PetOwner(row.name as string, row.cpf as string, row.email as string);

    owner.setId(row.id as number);

    return owner;
  }

  getOwners(): PetOwner[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pet_owners
    `);

    const rows = stmt.all();

    return rows.map((row) => {
      const owner = new PetOwner(row.name as string, row.cpf as string, row.email as string);

      owner.setId(row.id as number);

      return owner;
    });
  }

  getPetById(id: number): Pet {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pets
        WHERE id = ?
        LIMIT 1
    `);

    const row = stmt.get(id);

    if (!row) {
      throw new EntityNotFoundError(id);
    }

    const owner = this.getOwnerById(row.pet_owner_id as number);

    const pet = new Pet(owner, row.name as string, row.specie as string, row.age as number, row.history as string);

    pet.setId(row.id as number);

    return pet;
  }

  getPets(): Pet[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pets
    `);

    const rows = stmt.all();

    return rows.map((row) => {
      const owner = this.getOwnerById(row.pet_owner_id as number);

      const pet = new Pet(owner, row.name as string, row.specie as string, row.age as number, row.history as string);

      pet.setId(row.id as number);

      return pet;
    });
  }

  getPetsByOwnerId(id: number): Pet[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pets
        WHERE pet_owner_id = ?
    `);

    const rows = stmt.all(id);

    return rows.map((row) => {
      const owner = this.getOwnerById(id);

      const pet = new Pet(owner, row.name as string, row.specie as string, row.age as number, row.history as string);

      pet.setId(row.id as number);

      return pet;
    });
  }

  getAppointmentById(id: number): Appointment {
    const stmt = this.db.prepare(`
        SELECT *
        FROM appointments
        WHERE id = ?
        LIMIT 1
    `);

    const row = stmt.get(id);

    if (!row) {
      throw new EntityNotFoundError(id);
    }

    const pet = this.getPetById(row.pet_id as number);

    const veterinarian = this.getVeterinarianById(row.veterinarian_id as number);

    const appointment = new Appointment(row.exam_type as ExamType, row.date as string, pet, veterinarian);

    appointment.setId(row.id as number);
    appointment.setStatus(row.status as Status);
    if (row.diagnosis) appointment.setDiagnosis(row.diagnosis as string);

    return appointment;
  }

  getAppointments(): Appointment[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM appointments
    `);

    const rows = stmt.all();

    return rows.map((row) => {
      const pet = this.getPetById(row.pet_id as number);

      const veterinarian = this.getVeterinarianById(row.veterinarian_id as number);

      const appointment = new Appointment(row.exam_type as ExamType, row.date as string, pet, veterinarian);

      appointment.setId(row.id as number);
      appointment.setStatus(row.status as Status);
      if (row.diagnosis) appointment.setDiagnosis(row.diagnosis as string);

      return appointment;
    });
  }

  getAppointmentsByStatus(status: Status): Appointment[] {
    const stmt = this.db.prepare(`
        SELECT *
        FROM appointments
        WHERE status = ?
    `);

    const rows = stmt.all(status);

    return rows.map((row) => {
      const pet = this.getPetById(row.pet_id as number);
      const veterinarian = this.getVeterinarianById(row.veterinarian_id as number);
      const appointment = new Appointment(row.exam_type as ExamType, row.date as string, pet, veterinarian);

      appointment.setId(row.id as number);
      appointment.setStatus(row.status as Status);
      if (row.diagnosis) appointment.setDiagnosis(row.diagnosis as string);

      return appointment;
    });
  }

  findPets(search: PetSearch): Pet[] {
    const byDiagnosis = search.diagnosis !== undefined;
    const stmt = this.db.prepare(`
        SELECT DISTINCT p.id, p.pet_owner_id, p.name, p.specie, p.age, p.history
        FROM appointments a
        JOIN pets p ON a.pet_id = p.id
        WHERE a.status = ?
          AND (? IS NULL OR LOWER(TRIM(p.specie)) = LOWER(?))
          AND ${byDiagnosis ? "LOWER(a.diagnosis) LIKE ?" : "a.exam_type = ?"}
    `);
    const specie = search.specie || null;
    const criterion = byDiagnosis ? `%${search.diagnosis!.toLowerCase()}%` : search.examType!;
    const rows = stmt.all(Status.Realized, specie, specie, criterion);
    return rows.map((row) => {
      const owner = this.getOwnerById(row.pet_owner_id as number);
      const pet = new Pet(owner, row.name as string, row.specie as string, row.age as number, row.history as string);
      pet.setId(row.id as number);
      return pet;
    });
  }

  findVetByCrmv(crmv: string): Veterinarian | undefined {
    const stmt = this.db.prepare(`
        SELECT *
        FROM veterinarians
        WHERE crmv = ?
        LIMIT 1
    `);

    const row = stmt.get(crmv);

    if (!row) {
      return undefined;
    }

    const veterinarian = new Veterinarian(
      row.name as string,
      row.cpf as string,
      row.email as string,
      row.crmv as string,
    );

    veterinarian.setId(row.id as number);

    return veterinarian;
  }

  findOwnerByEmail(email: string): PetOwner | undefined {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pet_owners
        WHERE email = ?
        LIMIT 1
    `);

    const row = stmt.get(email);

    if (!row) {
      return undefined;
    }

    const owner = new PetOwner(row.name as string, row.cpf as string, row.email as string);

    owner.setId(row.id as number);

    return owner;
  }

  findOwnerByCpf(cpf: string): PetOwner | undefined {
    const stmt = this.db.prepare(`
        SELECT *
        FROM pet_owners
        WHERE cpf = ?
        LIMIT 1
    `);

    const row = stmt.get(cpf);

    if (!row) {
      return undefined;
    }

    const owner = new PetOwner(row.name as string, row.cpf as string, row.email as string);

    owner.setId(row.id as number);

    return owner;
  }

  emailExists(email: string): boolean {
    const stmt = this.db.prepare(`
        SELECT 1
        FROM (
            SELECT email FROM pet_owners
            UNION
            SELECT email FROM veterinarians
        )
        WHERE email = ?
        LIMIT 1
    `);

    const checkEmail = stmt.get(email);

    return !!checkEmail;
  }

  crmvExists(crmv: string): boolean {
    const stmt = this.db.prepare(`
        SELECT 1
        FROM veterinarians
        WHERE crmv = ?
        LIMIT 1
    `);

    const checkCrmv = stmt.get(crmv);

    return !!checkCrmv;
  }

  cpfExists(cpf: string): boolean {
    const stmt = this.db.prepare(`
        SELECT 1
        FROM (
            SELECT cpf FROM pet_owners
            UNION
            SELECT cpf FROM veterinarians
        )
        WHERE cpf = ?
        LIMIT 1
    `);

    const result = stmt.get(cpf);

    return !!result;
  }

  finishAppointment(id: number, diagnosis: string): void {
    const stmt = this.db.prepare(`
        UPDATE appointments
        SET diagnosis = ?, status = ?
        WHERE id = ?
    `);

    stmt.run(diagnosis, Status.Realized, id);
  }

  cancelAppointment(id: number): void {
    const stmt = this.db.prepare(`
        UPDATE appointments
        SET status = ?
        WHERE id = ?
    `);

    stmt.run(Status.Cancelled, id);
  }
}
