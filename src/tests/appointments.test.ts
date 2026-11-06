import { MainController } from "../controller/MainController";
import { AppointmentNotFound } from "../errors/Errors";
import { IDatabase } from "../interfaces/IDatabase";
import { Appointment } from "../models/Appointment";

describe("MainController - realizar consulta", () => {
	let database: jest.Mocked<IDatabase>;
	let controller: MainController;

	beforeEach(() => {
		database = {
			getAppointmentById: jest.fn(),
			finishAppointment: jest.fn(),
		} as unknown as jest.Mocked<IDatabase>;

		controller = new MainController(database);
	});

	test("deve retornar a consulta quando o protocolo existe", () => {
		const appointment = {} as Appointment;
		database.getAppointmentById.mockReturnValue(appointment);

		const result = controller.getAppointmentById(5);

		expect(result).toBe(appointment);
		expect(database.getAppointmentById).toHaveBeenCalledWith(5);
	});

	test("deve lançar AppointmentNotFound quando o protocolo não existe", () => {
		database.getAppointmentById.mockReturnValue(
			undefined as unknown as Appointment,
		);

		expect(() => controller.getAppointmentById(99)).toThrow(
			AppointmentNotFound,
		);
	});

	test("deve finalizar a consulta quando recebe diagnóstico", () => {
		controller.finishAppointment(5, "Gripe canina");

		expect(database.finishAppointment).toHaveBeenCalledWith(5, "Gripe canina");
	});
});

describe("MainController - diagnóstico obrigatório", () => {
  test("não finaliza consulta com diagnóstico em branco", () => {
    const appointment = { getDiagnosis: () => "" } as Appointment;
    const database = { getAppointmentById: jest.fn().mockReturnValue(appointment), finishAppointment: jest.fn() } as unknown as jest.Mocked<IDatabase>;
    const controller = new MainController(database);
    expect(() => controller.finishAppointment(1, "   ")).toThrow("Para finalizar a consulta");
    expect(database.finishAppointment).not.toHaveBeenCalled();
  });
});
