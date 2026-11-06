import { Pet } from "../models/Pet";
import { PetOwner } from "../models/PetOwner";

describe("Criação do Pet", () => {
  test("Deve criar um pet com sucesso quando todos os dados forem válidos", () => {
    const owner = new PetOwner("João", "12345678900", "joao@gmail.com");
    const pet = new Pet(owner, "Rex", "cão", 2);

    expect(pet).toBeInstanceOf(Pet);
    expect(pet.showSummary()).toBe(
      `Nome: ${pet.getName()}\nEspécie: ${pet.getSpecie()}\nTutor: ${pet.getOwner().getName()}\nHistórico: ${pet.getHistory()}`,
    );
  });
});

describe("Criação de pet com ou sem history", () => {
  test("Deve retonar uma string vazia", () => {
    const owner = new PetOwner("João", "12345678900", "joao@gmail.com");
    const pet = new Pet(owner, "Rex", "cão", 2);

    expect(pet.getHistory()).toBe("");
  });

  test("Deve retonar uma string com descrição do history", () => {
    const owner = new PetOwner("João", "12345678900", "joao@gmail.com");
    const pet = new Pet(owner, "Rex", "cão", 2, "Cão alérgico a castanha");

    expect(pet.getHistory()).toBe("Cão alérgico a castanha");
  });
});
