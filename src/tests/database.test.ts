import { Database } from "../database/Database";
import { PetOwner } from "../models/PetOwner";
import { Veterinarian } from "../models/Veterinarian";
import { Pet } from "../models/Pet";
import { Appointment } from "../models/Appointment";
import { ExamType } from "../models/enums/ExamTypeEnums";

describe("Database - busca composta de pets", () => {
  let db: Database;
  let cat: Pet;
  let dog: Pet;
  let vet: Veterinarian;

  beforeEach(() => {
    db = new Database(":memory:");
    const owner = new PetOwner("Ana", "123", "ana@email.com");
    vet = new Veterinarian("João", "456", "joao@email.com", "1234");
    db.createOwner(owner);
    db.createVeterinarian(vet);
    cat = new Pet(owner, "Mimi", "Gato", 3);
    dog = new Pet(owner, "Rex", "Cão", 4);
    db.createPet(cat);
    db.createPet(dog);
  });

  afterEach(() => db.close());

  function appointment(pet: Pet, exam: ExamType, diagnosis?: string): Appointment {
    const result = new Appointment(exam, "2026-11-06", pet, vet);
    db.createAppointment(result);
    if (diagnosis !== undefined) db.finishAppointment(result.getId()!, diagnosis);
    return result;
  }

  test("combina espécie e diagnóstico sem diferenciar maiúsculas", () => {
    appointment(cat, ExamType.Hemogram, "Suspeita de FeLV");
    appointment(dog, ExamType.Hemogram, "FeLV");
    expect(db.findPets({ specie: "gato", diagnosis: "felv" }).map(p => p.getName())).toEqual(["Mimi"]);
    expect(db.findPets({ diagnosis: "felv" })).toHaveLength(2);
  });

  test("combina espécie e exame realizado ou busca todas as espécies", () => {
    appointment(cat, ExamType.Hemogram, "Normal");
    appointment(dog, ExamType.Hemogram, "Normal");
    appointment(cat, ExamType.Routine, "Normal");
    expect(db.findPets({ specie: "Gato", examType: ExamType.Hemogram }).map(p => p.getName())).toEqual(["Mimi"]);
    expect(db.findPets({ examType: ExamType.Hemogram })).toHaveLength(2);
    expect(db.findPets({ specie: "Gato", examType: ExamType.XRay })).toEqual([]);
  });

  test("ignora consultas agendadas e canceladas e não repete o mesmo pet", () => {
    appointment(cat, ExamType.Hemogram, "Normal");
    appointment(cat, ExamType.Hemogram, "Normal");
    appointment(dog, ExamType.Hemogram);
    const cancelled = appointment(dog, ExamType.Hemogram, "Normal");
    db.cancelAppointment(cancelled.getId()!);
    expect(db.findPets({ examType: ExamType.Hemogram }).map(p => p.getName())).toEqual(["Mimi"]);
    expect(db.findPets({ diagnosis: "normal" }).map(p => p.getName())).toEqual(["Mimi"]);
  });
});
