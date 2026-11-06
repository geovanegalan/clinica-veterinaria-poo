import { PetOwner } from "../models/PetOwner";
import { Veterinarian } from "../models/Veterinarian";
import { IDatabase } from "../interfaces/IDatabase";

describe("Listar todos os usuários do sistema e suas roles", () => {
  let database: jest.Mocked<IDatabase>;

  const owner1 = new PetOwner("João", "12345678900", "joao@email.com");
  const owner2 = new PetOwner("Maria", "12345678912", "maria@email.com");
  const veterinarian1 = new Veterinarian("José", "78945678944", "jose@email.com", "crmv/pr 78945-V");
  const veterinarian2 = new Veterinarian("Alice", "78945678936", "alice@email.com", "crmv/pr 78632-V");

  beforeEach(() => {
    database = {
      getVeterinarians: jest.fn(),
      getOwners: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;
  });

  test("deve retornar a lista combinada de donos de pet e veterinários", () => {
    database.getOwners.mockReturnValue([owner1, owner2]);
    database.getVeterinarians.mockReturnValue([veterinarian1, veterinarian2]);

    const users = [...database.getOwners(), ...database.getVeterinarians()];

    expect(users).toHaveLength(4);
    expect(users).toContain(owner1);
    expect(users).toContain(veterinarian1);
  });
});
