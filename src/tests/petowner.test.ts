import { Pet } from "../models/Pet";
import { PetOwner } from "../models/PetOwner";

describe("Criação de um Dono de pet", () => {
  const owner = new PetOwner("João", "12345678900", "joao@gmail.com");

  test("Deve cadastrar com sucesso e iniciar um array vazio de Pets", () => {
    expect(owner.getPets()).toEqual([]);
  });

  test("showData() deve retornar os dados do dono", () => {
    expect(owner.showData()).toBe("Nome: João CPF: 12345678900 Contato: joao@gmail.com");
  });

  test("getRole deve retornar: Dono de Pet.", () => {
    expect(owner.getRole()).toBe("Dono de Pet.");
  });

  test("Deve adicionar pet automaticamente na lista do dono ao instanciar Pet", () => {
    const ownerWithPet = new PetOwner("Maria", "98765432100", "maria@gmail.com");
    const pet = new Pet(ownerWithPet, "Thor", "Cachorro", 3);

    expect(ownerWithPet.getPets()).toHaveLength(1);
    expect(ownerWithPet.getPets()[0]).toBe(pet);
  });
});
