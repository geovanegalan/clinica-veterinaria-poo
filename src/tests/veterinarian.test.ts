import { Veterinarian } from "../models/Veterinarian";

describe("Verificação dos dados do veterinário", () => {
  const veterinarian = new Veterinarian("José", "78945678944", "jose@email.com", "crmv/pr 78945-V");

  test("Metodo getRole() deve exibir o CRMV", () => {
    expect(veterinarian.getRole()).toContain("crmv/pr 78945-V");
  });

  test("Metodo showData() deve exibir o CRMV", () => {
    expect(veterinarian.showData()).toContain("crmv/pr 78945-V");
  });
});
