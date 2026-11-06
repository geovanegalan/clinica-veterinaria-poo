import { User } from "./User";

export class Veterinarian extends User {
  private crmv: string;

  public constructor(name: string, cpf: string, email: string, crmv: string) {
    super(name, cpf, email);
    this.crmv = crmv;
  }

  public getCrmv(): string {
    return this.crmv;
  }

  public setCrmv(crmv: string): void {
    this.crmv = crmv;
  }

  public showData(): string {
    return `Nome: ${this.getName()} CRMV: ${this.crmv}`;
  }

  public getRole(): string {
    return `Médico Veterinário(a) - CRMV: ${this.getCrmv()}`;
  }
}
