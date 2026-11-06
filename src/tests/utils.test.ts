import { sortList } from "../utils/sort";

describe("sortList (função genérica de ordenação)", () => {
	test("deve ordenar números do menor para o maior", () => {
		const numbers = [7, 4, 1, 0, 9, 11];

		const result = sortList(numbers, (a, b) => a - b);

		expect(result).toEqual([0, 1, 4, 7, 9, 11]);
	});

	test("deve ordenar letras em ordem alfabética", () => {
		const letters = ["d", "b", "a", "c"];

		const result = sortList(letters, (a, b) => a.localeCompare(b));

		expect(result).toEqual(["a", "b", "c", "d"]);
	});
});

test("sortList preserva a lista original", () => {
  const original = [3, 1, 2];
  expect(sortList(original, (a, b) => a - b)).toEqual([1, 2, 3]);
  expect(original).toEqual([3, 1, 2]);
});
