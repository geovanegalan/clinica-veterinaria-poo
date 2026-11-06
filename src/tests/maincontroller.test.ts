import { MainController } from "../controller/MainController";
import { DuplicateDataError, NoVeterinariansError, OwnerHasNoPetsError } from "../errors/Errors";
import { IDatabase } from "../interfaces/IDatabase";
import { Pet } from "../models/Pet";
import { PetOwner } from "../models/PetOwner";
import { Veterinarian } from "../models/Veterinarian";
import { Appointment } from "../models/Appointment";
import { Status } from "../models/enums/StatusEnums";
import { ExamType } from "../models/enums/ExamTypeEnums";

describe("MainController.createPetOwner", () => {
  let database: jest.Mocked<IDatabase>;
  let controller: MainController;

  beforeEach(() => {
    database = {
      emailExists: jest.fn(),
      cpfExists: jest.fn(),
      createOwner: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;

    controller = new MainController(database);
  });

  test("Cadastrar usuário", () => {
    controller.createPetOwner("Ana", "ana@email.com", "12345678900");

    expect(database.createOwner).toHaveBeenCalledTimes(1);
  });

  test("Deve lançar DuplicateDataError quando o cpf já existe", () => {
    database.cpfExists.mockReturnValue(true);

    expect(() => controller.createPetOwner("Ana", "ana@email.com", "12345678900")).toThrow(DuplicateDataError);
    expect(database.createOwner).not.toHaveBeenCalled();
  });

  test("Deve lançar DuplicateDataError quando o email já existe", () => {
    database.emailExists.mockReturnValue(true);

    expect(() => controller.createPetOwner("Ana", "ana@email.com", "12345678900")).toThrow(DuplicateDataError);
    expect(database.createOwner).not.toHaveBeenCalled();
  });
});

describe("Maincontroller.createVeterinarian", () => {
  let database: jest.Mocked<IDatabase>;
  let controller: MainController;

  beforeEach(() => {
    database = {
      emailExists: jest.fn(),
      cpfExists: jest.fn(),
      crmvExists: jest.fn(),
      createVeterinarian: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;
    controller = new MainController(database);
  });

  test("Cadastrar veterinário", () => {
    controller.createVeterinarian("Bruno", "bruno@email.com", "78945612300", "CRMV-PR 12345-V");

    expect(database.createVeterinarian).toHaveBeenCalledTimes(1);
  });

  test("Deve lançar DuplicateDataError quando o CRMV já existe", () => {
    database.crmvExists.mockReturnValue(true);

    expect(() => controller.createVeterinarian("Bruno", "bruno@email.com", "78945612300", "CRMV-PR 12345-V")).toThrow(
      DuplicateDataError,
    );
    expect(database.createVeterinarian).not.toHaveBeenCalled();
  });
});

describe("Maincontroller.getPetsOwnerByCpf", () => {
  let database: jest.Mocked<IDatabase>;
  let controller: MainController;

  beforeEach(() => {
    database = {
      findOwnerByCpf: jest.fn(),
      getPetsByOwnerId: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;

    controller = new MainController(database);
  });

  test("Deve retornar a lista de pets", () => {
    const owner = new PetOwner("João", "12345678900", "joao@email.com");
    owner.setId(7);

    const pet = new Pet(owner, "Rex", "Cachorro", 2);

    const pets = [pet];

    database.findOwnerByCpf.mockReturnValue(owner);
    database.getPetsByOwnerId.mockReturnValue(pets);

    const result = controller.getPetsOwnerByCpf("12345678900");

    expect(result).toEqual(pets);
    expect(database.findOwnerByCpf).toHaveBeenCalledWith("12345678900");
    expect(database.getPetsByOwnerId).toHaveBeenCalledTimes(1);
    expect(database.getPetsByOwnerId).toHaveBeenCalledWith(7);
  });

  test("Deve lançar OwnerHasNoPets quando o dono não possui pets cadastrados", () => {
    const owner = new PetOwner("João", "12345678900", "joao@email.com");
    owner.setId(7);

    database.findOwnerByCpf.mockReturnValue(owner);
    database.getPetsByOwnerId.mockReturnValue([]);

    expect(() => controller.getPetsOwnerByCpf("12345678900")).toThrow(OwnerHasNoPetsError);

    expect(database.getPetsByOwnerId).toHaveBeenCalledTimes(1);
    expect(database.getPetsByOwnerId).toHaveBeenCalledWith(7);
  });
});

describe("MainController.getAppointmentsByStatus", () => {
  let database: jest.Mocked<IDatabase>;
  let controller: MainController;

  beforeEach(() => {
    database = {
      getAppointmentsByStatus: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;

    controller = new MainController(database);
  });

  test("Deve retornar consultas filtradas por status", () => {
    const owner = new PetOwner("Carlos", "11122233344", "carlos@email.com");
    const vet = new Veterinarian("Dra. Paula", "55566677788", "paula@email.com", "CRMV-PR 9999");
    const pet = new Pet(owner, "Mimi", "Gato", 3);

    const app1 = new Appointment(ExamType.Routine, "2026-10-25", pet, vet);
    app1.setStatus(Status.Scheduled);

    const app2 = new Appointment(ExamType.Hemogram, "2026-10-26", pet, vet);
    app2.setStatus(Status.Scheduled);

    database.getAppointmentsByStatus.mockReturnValue([app1, app2]);

    const result = controller.getAppointmentsByStatus(Status.Scheduled);

    expect(result).toHaveLength(2);
    expect(database.getAppointmentsByStatus).toHaveBeenCalledWith(Status.Scheduled);
  });
});

describe("MainController.findPets", () => {
  test("normaliza o diagnóstico e ordena os resultados", () => {
    const owner = new PetOwner("Marina", "123", "m@email.com");
    const database = { findPets: jest.fn().mockReturnValue([new Pet(owner, "Zack", "Gato", 4), new Pet(owner, "Bela", "Gato", 2)]) } as unknown as jest.Mocked<IDatabase>;
    const result = new MainController(database).findPets({ specie: " Gato ", diagnosis: " FeLV " });
    expect(database.findPets).toHaveBeenCalledWith({ specie: "Gato", diagnosis: "felv" });
    expect(result.map(p => p.getName())).toEqual(["Bela", "Zack"]);
  });
  test("não busca diagnóstico vazio e aceita exame para todas as espécies", () => {
    const database = { findPets: jest.fn().mockReturnValue([]) } as unknown as jest.Mocked<IDatabase>;
    const controller = new MainController(database);
    expect(controller.findPets({ diagnosis: "  " })).toEqual([]);
    expect(database.findPets).not.toHaveBeenCalled();
    controller.findPets({ examType: ExamType.Hemogram });
    expect(database.findPets).toHaveBeenCalledWith({ examType: ExamType.Hemogram });
  });
});

describe("MainController - veterinários para agendamento", () => {
  test("lança erro personalizado quando não há veterinários", () => {
    const database = { getVeterinarians: jest.fn().mockReturnValue([]) } as unknown as jest.Mocked<IDatabase>;
    expect(() => new MainController(database).getVeterinariansForAppointment()).toThrow(NoVeterinariansError);
  });
  test("retorna veterinários cadastrados", () => {
    const vet = new Veterinarian("Samara", "123", "s@email.com", "12345");
    const database = { getVeterinarians: jest.fn().mockReturnValue([vet]) } as unknown as jest.Mocked<IDatabase>;
    expect(new MainController(database).getVeterinariansForAppointment()).toEqual([vet]);
  });
});
