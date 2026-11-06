import { Cores } from "./Cores";
import { Appointment } from "../models/Appointment";
import { Pet } from "../models/Pet";
import { MainController } from "../controller/MainController";
import prompt from "../config/promptSync";
import { AppointmentNotFound, DuplicateDataError, EntityNotFoundError, MissingDiagnosisError, NoVeterinariansError, OwnerHasNoPetsError } from "../errors/Errors";
import { Status } from "../models/enums/StatusEnums";

export class MainScreen {
  private controller: MainController;

  constructor(controller: MainController) {
    this.controller = controller;
  }

  private campo(nome: string, valor: string | number | undefined): string {
    return `${Cores.destaque(nome + ":")} ${valor ?? "—"}`;
  }

  private separador(): void {
    console.log(Cores.discreto("-----------------------------------"));
  }

  private mostrarPet(pet: Pet): void {
    this.separador();
    console.log(this.campo("Nome", pet.getName()));
    console.log(this.campo("Espécie", pet.getSpecie()));
    console.log(this.campo("Tutor", pet.getOwner().getName()));
    console.log(this.campo("Histórico", pet.getHistory() || "—"));
  }

  private mostrarConsulta(consulta: Appointment): void {
    this.separador();
    const status = consulta.getStatus();
    const statusFormatado = status === Status.Realized ? Cores.sucesso(status)
      : status === Status.Cancelled ? Cores.erro(status) : Cores.aviso(status);
    console.log(this.campo("Protocolo", consulta.getId()));
    console.log(this.campo("Status", statusFormatado));
    console.log(this.campo("Paciente", consulta.getPet().getName()));
    console.log(this.campo("Data", consulta.getDate()));
    console.log(this.campo("Exame", consulta.getExamType()));
    console.log(this.campo("Médico veterinário", `${consulta.getVeterinarian().getName()} - CRMV ${consulta.getVeterinarian().getCrmv()}`));
    console.log(this.campo("Diagnóstico", consulta.getDiagnosis() || "—"));
  }

  public start(): void {
    this.showOptions();
  }

  public showOptions(): void {
    let op: number = 999;

    while (op !== 0) {
      console.log(Cores.titulo("\n========== CLÍNICA VETERINÁRIA =========="));
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
          console.log(Cores.titulo("\nCadastrar Dono"));
          this.registerOwner();
          break;

        case 2:
          console.log(Cores.titulo("\nCadastrar Veterinário"));
          this.registerVeterinarian();
          break;

        case 3:
          console.log(Cores.titulo("\nCadastrar Pet"));
          this.registerPet();
          break;

        case 4:
          console.log(Cores.titulo("\nAgendar Consulta"));
          this.appointExam();
          break;

        case 5:
          console.log(Cores.titulo("\nListar Veterinários"));
          this.showVets();
          break;

        case 6:
          console.log(Cores.titulo("\nListar Pets"));
          this.showPets();
          break;

        case 7:
          console.log(Cores.titulo("\nListar Donos"));
          this.showOwners();
          break;

        case 8:
          console.log(Cores.titulo("\nListar Consultas"));
          this.showAppointments();
          break;

        case 9:
          console.log(Cores.titulo("\nRealizar Consulta (registrar diagnóstico)"));
          this.realizeAppointment();
          break;

        case 10:
          console.log(Cores.titulo("\nListar todos os usuários"));
          this.showAllUsers();
          break;

        case 11:
          console.log(Cores.titulo("\nBuscar Consultas por Status"));
          this.searchAppointmentsByStatus();
          break;

        case 12:
          console.log(Cores.titulo("\nBuscar Pets por Espécie e Diagnóstico ou Exame"));
          this.searchPets();
          break;

        case 13:
          console.log(Cores.titulo("\nCancelar Consulta"));
          this.cancelAppointment();
          break;

        case 0:
          console.log(Cores.sucesso("Saindo do sistema... Até logo!"));
          break;

        default:
          console.log(Cores.aviso("Opção inválida! Por favor, escolha um número válido do menu."));
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
      console.log(Cores.sucesso("Usuário cadastrado com sucesso!"));
    } catch (error: unknown) {
      if (error instanceof DuplicateDataError) {
        console.error(Cores.erro(String("Dado duplicado:" + error.message)));
      } else {
        console.error(Cores.erro(String("Ocorreu um erro inesperado!" + error)));
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
      console.log(Cores.sucesso("Veterinário cadastrado com sucesso!"));
    } catch (error: unknown) {
      if (error instanceof DuplicateDataError) {
        console.error(Cores.erro(String("Dado duplicado:" + error.message)));
      } else {
        console.error(Cores.erro(String("Ocorreu um erro inesperado!" + error)));
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
      console.log(Cores.sucesso("Pet Cadastrado com sucesso!"));
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        console.error(Cores.erro(String("Usuário não encontrado:" + error.message)));
      } else {
        console.error(Cores.erro(String("Ocorreu um erro inesperado!" + error)));
      }
    }
  }

  public appointExam(): void {
    try {
      const cpf = prompt("Digite o cpf:");
      const petsOwner = this.controller.getPetsOwnerByCpf(cpf);

      petsOwner.forEach((pet, i) => {
        console.log(`${Cores.destaque(String(i + 1))} - ${pet.getName()} (${pet.getSpecie()})`);
      });

      let num: number;

      do {
        num = +prompt("Qual pet gostaria de agendar?:");

        if (num < 1 || num > petsOwner.length || !Number.isInteger(num)) {
          console.log(Cores.aviso("Pet inválido! Escolha um número da lista."));
        }
      } while (num < 1 || num > petsOwner.length || !Number.isInteger(num));

      const pet = petsOwner[num - 1]!;

      const exams = this.controller.getExams();

      exams.forEach((exam, i) => {
        console.log(`${Cores.destaque(String(i + 1))} - ${exam}`);
      });

      let examNum: number;

      do {
        examNum = +prompt("Qual exame gostaria de agendar?");

        if (examNum < 1 || examNum > exams.length || !Number.isInteger(examNum)) {
          console.log(Cores.aviso("Exame inválido! Escolha um número da lista."));
        }
      } while (examNum < 1 || examNum > exams.length || !Number.isInteger(examNum));

      const exam = exams[examNum - 1]!;

      const dateForExam = prompt("Data:");

      const vets = this.controller.getVeterinariansForAppointment();

      vets.forEach((vet, i) => {
        console.log(`${Cores.destaque(String(i + 1))} - ${vet.getName()}`);
      });

      let vetIndex: number;

      do {
        vetIndex = +prompt("Selecione o médico veterinario:");

        if (vetIndex < 1 || vetIndex > vets.length || !Number.isInteger(vetIndex)) {
          console.log(Cores.aviso("Veterinário inválido! Escolha um número da lista."));
        }
      } while (vetIndex < 1 || vetIndex > vets.length || !Number.isInteger(vetIndex));

      const selectedVet = vets[vetIndex - 1]!;

      this.controller.createAppointment(exam, dateForExam, pet, selectedVet);

      console.log(Cores.sucesso("Consulta agendada com sucesso!"));
      console.log([this.campo("Paciente", pet.getName()), this.campo("Data", dateForExam), this.campo("Médico veterinário", selectedVet.getName())].join("\n"));
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        console.error(Cores.erro(String("Usuário não encontrado:" + error.message)));
      } else if (error instanceof OwnerHasNoPetsError) {
        console.error(Cores.erro(String("Usuário não tem pets cadastrados:" + error.message)));
      } else if (error instanceof NoVeterinariansError) {
        console.log(Cores.aviso(error.message));
      } else {
        console.error(Cores.erro(String("Aconteceu um erro inesperado!" + error)));
      }
    }
  }

  public showVets(): void {
    try {
      const vets = this.controller.getVeterinarians();
      vets.forEach((v) => {
        this.separador();
        console.log(this.campo("Nome", v.getName()));
        console.log(this.campo("CRMV", v.getCrmv()));
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
      }
    }
  }

  public showPets(): void {
    try {
      const pets = this.controller.getPets();
      pets.forEach((p) => {
        this.mostrarPet(p);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
      }
    }
  }

  public showOwners(): void {
    try {
      const owners = this.controller.getOwners();
      owners.forEach((o) => {
        this.separador();
        console.log(this.campo("Nome", o.getName()));
        console.log(this.campo("CPF", o.getCpf()));
        console.log(this.campo("Contato", o.getEmail()));
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
      }
    }
  }

  public showAppointments(): void {
    try {
      const appointments = this.controller.getAppointments();
      appointments.forEach((a) => {
        this.mostrarConsulta(a);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
      }
    }
  }

  public showAllUsers(): void {
    const usuarios = this.controller.getAllUsers();
    usuarios.forEach((u) => {
      this.separador();
      console.log(this.campo("Nome", u.getName()));
      console.log(this.campo("Papel", u.getRole()));
    });
  }

  public realizeAppointment(): void {
    try {
      const protocol = +prompt("Insira o número do protocolo do exame:");
      const appointment = this.controller.getAppointmentById(protocol);
      this.mostrarConsulta(appointment);

      const diagnosis = prompt("Dignóstico:");

      this.controller.finishAppointment(protocol, diagnosis);
      console.log(Cores.sucesso("Exame finalizado com sucesso!"));
      const appointmentAtualizada = this.controller.getAppointmentById(protocol);
      this.mostrarConsulta(appointmentAtualizada);
    } catch (error: unknown) {
      if (error instanceof AppointmentNotFound) {
        console.error(Cores.erro(error.message));
      } else if (error instanceof MissingDiagnosisError) {
        console.error(Cores.erro(String("Insira o diagnóstico:" + error.message)));
      } else {
        console.error(Cores.erro(String("Aconteceu um erro inesperado!" + error)));
      }
    }
  }

  public searchAppointmentsByStatus(): void {
    try {
      console.log(Cores.titulo("Selecione o status da consulta:"));
      console.log(Cores.aviso("1 - Agendada"));
      console.log(Cores.sucesso("2 - Realizada"));
      console.log(Cores.erro("3 - Cancelada"));
      const option = +prompt("Opção: ");
      let status: Status;

      if (option === 1) {
        status = Status.Scheduled;
      } else if (option === 2) {
        status = Status.Realized;
      } else if (option === 3) {
        status = Status.Cancelled;
      } else {
        console.log(Cores.aviso("Opção de status inválida!"));
        return;
      }

      const appointments = this.controller.getAppointmentsByStatus(status);
      if (appointments.length === 0) {
        console.log(Cores.aviso(`Nenhuma consulta encontrada com o status '${status}'.`));
        return;
      }

      appointments.forEach((a) => {
        this.mostrarConsulta(a);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
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
          console.log(Cores.aviso("Palavra-chave não informada!"));
          return;
        }
        pets = this.controller.findPets({ ...(specie ? { specie } : {}), diagnosis });
      } else if (option === 2) {
        const exams = this.controller.getExams();
        exams.forEach((exam, i) => console.log(`${i + 1} - ${exam}`));
        const index = +prompt("Selecione o exame: ");
        if (!Number.isInteger(index) || index < 1 || index > exams.length) {
          console.log(Cores.aviso("Exame inválido!"));
          return;
        }
        pets = this.controller.findPets({ ...(specie ? { specie } : {}), examType: exams[index - 1]! });
      } else {
        console.log(Cores.aviso("Opção inválida!"));
        return;
      }
      if (pets.length === 0) {
        console.log(Cores.aviso("Nenhum pet encontrado para os filtros informados."));
        return;
      }
      pets.forEach((pet) => this.mostrarPet(pet));
    } catch (error: unknown) {
      console.error(Cores.erro("Ocorreu um erro ao buscar pets: " + String(error)));
    }
  }

  public cancelAppointment(): void {
    try {
      const protocol = +prompt("Insira o número do protocolo da consulta a ser cancelada: ");
      this.controller.cancelAppointment(protocol);
      console.log(Cores.sucesso(`Consulta com protocolo ${protocol} cancelada com sucesso!`));
    } catch (error: unknown) {
      if (error instanceof AppointmentNotFound) {
        console.error(Cores.erro(error.message));
      } else if (error instanceof Error) {
        console.error(Cores.erro("Erro: " + error.message));
      } else {
        console.error(Cores.erro("Aconteceu um erro inesperado! " + error));
      }
    }
  }
}
