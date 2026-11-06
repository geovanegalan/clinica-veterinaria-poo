import { Pet } from "./Pet";
import { User } from "./User";

export class PetOwner extends User {
  private pets: Pet[] = [];

  public constructor(name: string, cpf: string, email: string) {
    super(name, cpf, email);
  }

  public getPets(): Pet[] {
    return this.pets;
  }

  public addPets(petData: Pet): void {
    this.pets.push(petData);
  }

  public showData(): string {
    return `Nome: ${this.getName()} CPF: ${this.getCpf()} Contato: ${this.getEmail()}`;
  }

  public getRole(): string {
    return "Dono de Pet.";
  }
}
