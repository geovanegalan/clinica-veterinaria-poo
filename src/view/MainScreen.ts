import { MainController } from "../controller/MainController";
import prompt from "../config/promptSync";
import { DuplicateDataError, EntityNotFoundError, MissingDiagnosisError, OwnerHasNoPetsError } from "../errors/Errors";
import { Status } from "../models/enums/StatusEnums";

export class MainScreen {
  private controller: MainController;

  constructor(controller: MainController) {
    this.controller = controller;
  }

  public start(): void {
    this.showOptions();
  }

  public showOptions(): void {
    let op: number = 999;

    while (op !== 0) {
      op = +prompt(`
        1 - Cadastrar Dono
        2 - Cadastrar Veterinário
        3 - Cadastrar Pet
        4 - Agendar Consulta 
        5 - Listar Veterinários
        6 - Listar Pets
        7 - Listar Donos
        8 - Listar Consultas
        9 - Realizar Consulta (registrar diagnóstico)
        10 - Listar todos os Usuários do sistema
        11 - Buscar Consultas por Status (Agendadas, Realizadas, Canceladas)
        12 - Buscar Pets por Espécie e Diagnóstico ou Exame
        13 - Cancelar Consulta
        0 - Sair
        \nDigite a opção desejada: `);

      switch (op) {
        case 1:
          console.log("Executando: Cadastrar Dono");
          this.registerOwner();
          break;

        case 2:
          console.log("Executando: Cadastrar Veterinário");
          this.registerVeterinarian();
          break;

        case 3:
          console.log("Executando: Cadastrar Pet");
          this.registerPet();
          break;

        case 4:
          console.log("Executando: Agendar Consulta");
          this.appointExam();
          break;

        case 5:
          console.log("Executando: Listar Veterinários");
          this.showVets();
          break;

        case 6:
          console.log("Executando: Listar Pets");
          this.showPets();
          break;

        case 7:
          console.log("Executando: Listar Donos");
          this.showOwners();
          break;

        case 8:
          console.log("Executando: Listar Consultas");
          this.showAppointments();
          break;

        case 9:
          console.log("Executando: Realizar Consulta (registrar diagnóstico)");
          this.realizeAppointment();
          break;

        case 10:
          console.log("Executando: Listar todos os usuários");
          this.showAllUsers();
          break;

        case 11:
          console.log("Executando: Buscar Consultas por Status");
          this.searchAppointmentsByStatus();
          break;

        case 12:
          console.log("Executando: Buscar Pets por Espécie e Diagnóstico ou Exame");
          this.searchPets();
          break;

        case 13:
          console.log("Executando: Cancelar Consulta");
          this.cancelAppointment();
          break;

        case 0:
          console.log("Saindo do sistema... Até logo!");
          break;

        default:
          console.log("Opção inválida! Por favor, escolha um número válido do menu.");
          break;
      }
    }
  }

  public registerOwner(): void {
    try {
      const name = prompt("Nome do dono:");
      const email = prompt("Email:");
      const cpf = prompt("CPF:");

      this.controller.createPetOwner(name, email, cpf);
      console.log("Usuário cadastrado com sucesso!");
    } catch (error: unknown) {
      if (error instanceof DuplicateDataError) {
        console.error("Dado duplicado:" + error.message);
      } else {
        console.error("Ocorreu um erro inesperado!" + error);
      }
    }
  }

  public registerVeterinarian(): void {
    try {
      const name = prompt("Nome:");
      const email = prompt("Email:");
      const cpf = prompt("CPF:");
      const crmv = prompt("CRMV:");

      this.controller.createVeterinarian(name, email, cpf, crmv);
      console.log("Veterinário cadastrado com sucesso!");
    } catch (error: unknown) {
      if (error instanceof DuplicateDataError) {
        console.error("Dado duplicado:" + error.message);
      } else {
        console.error("Ocorreu um erro inesperado!" + error);
      }
    }
  }

  public registerPet(): void {
    try {
      const name = prompt("Nome");
      const specie = prompt("Especie");
      const age = +prompt("Idade");
      const ownercpf = prompt("Cpf do dono:");

      const hasHistory = +prompt("O animal possui algum histórico/observação?\n1 - SIM\n0 - NÃO");
      if (hasHistory) {
        const history = prompt("Descreva a condição:");
        this.controller.createPet(name, specie, age, ownercpf, history);
      } else {
        this.controller.createPet(name, specie, age, ownercpf);
      }
      console.log("Pet Cadastrado com sucesso!");
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        console.error("Usuário não encontrado:" + error.message);
      } else {
        console.error("Ocorreu um erro inesperado!" + error);
      }
    }
  }

  public appointExam(): void {
    try {
      const cpf = prompt("Digite o cpf:");
      const petsOwner = this.controller.getPetsOwnerByCpf(cpf);

      petsOwner.forEach((pet, i) => {
        console.log(`${i + 1} - ${pet.getName()} (${pet.getSpecie()})`);
      });

      let num: number;

      do {
        num = +prompt("Qual pet gostaria de agendar?:");

        if (num < 1 || num > petsOwner.length || !Number.isInteger(num)) {
          console.log("Pet inválido! Escolha um número da lista.");
        }
      } while (num < 1 || num > petsOwner.length || !Number.isInteger(num));

      const pet = petsOwner[num - 1]!;

      const exams = this.controller.getExams();

      exams.forEach((exam, i) => {
        console.log(`${i + 1} - ${exam}`);
      });

      let examNum: number;

      do {
        examNum = +prompt("Qual exame gostaria de agendar?");

        if (examNum < 1 || examNum > exams.length || !Number.isInteger(examNum)) {
          console.log("Exame inválido! Escolha um número da lista.");
        }
      } while (examNum < 1 || examNum > exams.length || !Number.isInteger(examNum));

      const exam = exams[examNum - 1]!;

      const dateForExam = prompt("Data:");

      const vets = this.controller.getVeterinarians();

      vets.forEach((vet, i) => {
        console.log(`${i + 1} - ${vet.getName()}`);
      });

      let vetIndex: number;

      do {
        vetIndex = +prompt("Selecione o médico veterinario:");

        if (vetIndex < 1 || vetIndex > vets.length || !Number.isInteger(vetIndex)) {
          console.log("Veterinário inválido! Escolha um número da lista.");
        }
      } while (vetIndex < 1 || vetIndex > vets.length || !Number.isInteger(vetIndex));

      const selectedVet = vets[vetIndex - 1]!;

      this.controller.createAppointment(exam, dateForExam, pet, selectedVet);

      console.log("Consulta agendada com sucesso!");
      console.log(`Paciente:${pet.getName()}\nData:${dateForExam}\nMédico Veterinario: ${selectedVet.getName()}`);
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        console.error("Usuário não encontrado:" + error.message);
      } else if (error instanceof OwnerHasNoPetsError) {
        console.error("Usuário não tem pets cadastrados:" + error.message);
      } else {
        console.error("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public showVets(): void {
    try {
      const vets = this.controller.getVeterinarians();
      vets.forEach((v) => {
        console.log(`---------------------------\n${v.showData()}\n---------------------------`);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public showPets(): void {
    try {
      const pets = this.controller.getPets();
      pets.forEach((p) => {
        console.log(`---------------------------\n${p.showSummary()}\n---------------------------`);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public showOwners(): void {
    try {
      const owners = this.controller.getOwners();
      owners.forEach((o) => {
        console.log(`---------------------------\n${o.showData()}\n---------------------------`);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public showAppointments(): void {
    try {
      const appointments = this.controller.getAppointments();
      appointments.forEach((a) => {
        console.log(a.showDataAppointment());
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public showAllUsers(): void {
    const usuarios = this.controller.getAllUsers();
    usuarios.forEach((u) => console.log(`${u.getName()} — ${u.getRole()}`));
  }

  public realizeAppointment(): void {
    try {
      const protocol = +prompt("Insira o número do protocolo do exame:");
      const appointment = this.controller.getAppointmentById(protocol);
      console.log(appointment.showDataAppointment());

      const diagnosis = prompt("Dignóstico:");

      this.controller.finishAppointment(protocol, diagnosis);
      console.log("Exame finalizado com sucesso!");
      const appointmentAtualizada = this.controller.getAppointmentById(protocol);
      console.log(appointmentAtualizada.showDataAppointment());
    } catch (error: unknown) {
      if (error instanceof MissingDiagnosisError) {
        console.error("Insira o diagnóstico:" + error.message);
      } else {
        console.error("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public searchAppointmentsByStatus(): void {
    try {
      console.log("Selecione o status da consulta:");
      console.log("1 - Agendada");
      console.log("2 - Realizada");
      console.log("3 - Cancelada");
      const option = +prompt("Opção: ");
      let status: Status;

      if (option === 1) {
        status = Status.Scheduled;
      } else if (option === 2) {
        status = Status.Realized;
      } else if (option === 3) {
        status = Status.Cancelled;
      } else {
        console.log("Opção de status inválida!");
        return;
      }

      const appointments = this.controller.getAppointmentsByStatus(status);
      if (appointments.length === 0) {
        console.log(`Nenhuma consulta encontrada com o status '${status}'.`);
        return;
      }

      appointments.forEach((a) => {
        console.log(a.showDataAppointment());
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }

  public searchPets(): void {
    try {
      const specie = prompt("Espécie (deixe em branco para todas): ").trim();
      const option = +prompt("Buscar por: 1 - Diagnóstico | 2 - Exame realizado: ");
      let pets;
      if (option === 1) {
        const diagnosis = prompt("Palavra-chave do diagnóstico: ").trim();
        if (!diagnosis) {
          console.log("Palavra-chave não informada!");
          return;
        }
        pets = this.controller.findPets({ ...(specie ? { specie } : {}), diagnosis });
      } else if (option === 2) {
        const exams = this.controller.getExams();
        exams.forEach((exam, i) => console.log(`${i + 1} - ${exam}`));
        const index = +prompt("Selecione o exame: ");
        if (!Number.isInteger(index) || index < 1 || index > exams.length) {
          console.log("Exame inválido!");
          return;
        }
        pets = this.controller.findPets({ ...(specie ? { specie } : {}), examType: exams[index - 1]! });
      } else {
        console.log("Opção inválida!");
        return;
      }
      if (pets.length === 0) {
        console.log("Nenhum pet encontrado para os filtros informados.");
        return;
      }
      pets.forEach((pet) => console.log(`---------------------------\n${pet.showSummary()}\n---------------------------`));
    } catch (error: unknown) {
      console.error("Ocorreu um erro ao buscar pets:", error);
    }
  }

  public cancelAppointment(): void {
    try {
      const protocol = +prompt("Insira o número do protocolo da consulta a ser cancelada: ");
      this.controller.cancelAppointment(protocol);
      console.log(`Consulta com protocolo ${protocol} cancelada com sucesso!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Message:" + error.message);
      } else {
        console.log("Aconteceu um erro inesperado!" + error);
      }
    }
  }
}
