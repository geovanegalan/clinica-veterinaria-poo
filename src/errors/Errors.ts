import { Appointment } from "../models/Appointment";

export class DuplicateDataError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: string,
  ) {
    super(`O campo '${field}' já está cadastrado com o valor '${value}'.`);
    this.name = "DuplicateDataError";
  }
}

export class EntityNotFoundError extends Error {
  constructor(public readonly value: string | number) {
    super(`Não foi encontrado um Usuário com o cpf ${value}`);
    this.name = "EntityNotFoundError";
  }
}

export class OwnerHasNoPetsError extends Error {
  constructor(public readonly owner: string) {
    super(`O dono '${owner}' não possui nenhum pet cadastrado.`);
    this.name = "OwnerHasNoPetsError";
  }
}

export class DatabaseErrorNoId extends Error {
  constructor(public readonly entity: any) {
    super(`${entity} não possui um Identificador no Banco de dados`);
    this.name = "DatabaseErrorNoId";
  }
}

export class AppointmentNotFound extends Error {
  constructor(public readonly id: number) {
    super(`O protocolo: ${id} não foi encontrado!`);
    this.name = "AppointmentNotFound";
  }
}

export class MissingDiagnosisError extends Error {
  constructor(public readonly appointment: Appointment) {
    super(`Para finalizar a consulta, insira um diagnóstico. ${appointment.getDiagnosis()}`);
    this.name = "MissingDiagnosisError";
  }
}
