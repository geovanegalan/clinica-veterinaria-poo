import { PetOwner } from "./PetOwner";

export class Pet {
  private id?: number;
  private petOwner: PetOwner;
  private name: string;
  private specie: string;
  private age: number;
  private history: string | undefined;

  public constructor(petOwner: PetOwner, name: string, specie: string, age: number, history?: string) {
    this.petOwner = petOwner;
    this.name = name;
    this.specie = specie;
    this.age = age;
    this.history = history;
    this.petOwner.addPets(this);
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getOwner(): PetOwner {
    return this.petOwner;
  }

  public setOwner(ownerData: PetOwner): void {
    this.petOwner = ownerData;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getSpecie(): string {
    return this.specie;
  }

  public setSpecie(specie: string): void {
    this.specie = specie;
  }

  public getAge(): number {
    return this.age;
  }

  public setAge(age: number): void {
    this.age = age;
  }

  public getHistory(): string {
    if (this.history === undefined) return "";
    return this.history;
  }

  public setHistory(history: string): void {
    this.history = history;
  }

  public showSummary(): string {
    return `Nome: ${this.getName()}\nEspécie: ${this.getSpecie()}\nTutor: ${this.getOwner().getName()}\nHistórico: ${this.getHistory()}`;
  }
}
