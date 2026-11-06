export abstract class User {
  private name: string;
  private cpf: string;
  private email: string;
  private id?: number;

  public constructor(name: string, cpf: string, email: string) {
    this.name = name;
    this.cpf = cpf;
    this.email = email;
  }

  abstract showData(): string;

  public setId(id: number): void {
    this.id = id;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getCpf(): string {
    return this.cpf;
  }

  public setCpf(cpf: string): void {
    this.cpf = cpf;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public getRole(): string {
    return "Usuário do sistema!";
  }
}
