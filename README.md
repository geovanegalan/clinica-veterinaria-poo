# Clínica Veterinária — Projeto de POO

Sistema de gerenciamento de uma clínica veterinária executado no terminal, desenvolvido individualmente para a disciplina **TSI303 — Programação Orientada a Objetos**, da UTFPR.

O objetivo é praticar e fixar conceitos de POO usando um problema concreto. O projeto tem escopo intencionalmente simples e acadêmico: não pretende oferecer todas as funcionalidades ou validações de um sistema profissional.

## Funcionalidades

- Cadastrar tutores, veterinários e pets, associando cada pet ao seu tutor.
- Agendar consultas ou exames para um pet com um veterinário.
- Registrar diagnósticos e cancelar consultas.
- Listar tutores, veterinários, pets, consultas e usuários.
- Buscar consultas por status e pets por palavra-chave no diagnóstico.
- Salvar dados em SQLite entre execuções e ordenar listagens.

## Tecnologias e requisitos

- Node.js 24 e npm (o projeto utiliza o módulo nativo `node:sqlite`).
- TypeScript, SQLite e `prompt-sync`.
- Jest e `ts-jest` para testes.

## Como executar

No terminal, na pasta raiz do projeto:

```bash
npm install
npm run build
npm run js
```

O programa apresenta um menu numérico. Para agendar uma consulta, cadastre primeiro um tutor, um pet para esse tutor e um veterinário. Os dados são armazenados em `database/clinica.db`; execute o programa a partir da pasta raiz para que esse caminho seja encontrado.

Para executar os testes:

```bash
npm test
```

## Organização e conceitos de POO

O projeto usa uma organização inspirada em MVC: `MainScreen` apresenta o menu e recebe entradas, `MainController` coordena as operações e os modelos representam as entidades. A classe `Database` implementa `IDatabase` e cuida do acesso ao SQLite. Em `src/index.ts`, as dependências são criadas e passadas ao controller e à tela.

| Conceito | Aplicação no projeto |
| --- | --- |
| Classes, encapsulamento e associação | `PetOwner`, `Veterinarian`, `Pet` e `Appointment` representam o domínio, com atributos privados e relacionamentos entre objetos. |
| Herança e classe abstrata | `PetOwner` e `Veterinarian` herdam atributos comuns de `User`, que é abstrata. |
| Polimorfismo e sobrescrita | Cada tipo de usuário implementa `showData` e redefine `getRole`; a listagem de usuários usa o comportamento de cada objeto. |
| Interface e injeção de dependência | O controller recebe um `IDatabase` no construtor. Isso permite usar outra implementação ou uma simulação nos testes. |
| Enums | `ExamType` e `Status` representam tipos de exame e estados de consulta. |
| Sobrecarga | `createPet` possui assinaturas com e sem histórico. |
| Exceções | Erros personalizados, como `DuplicateDataError`, representam situações esperadas e são tratados com `try/catch`. |
| Genéricos | `sortList<T>` ordena listas de tipos diferentes usando um comparador. |
| Persistência, busca e ordenação | `Database` salva e consulta dados no SQLite; o controller aplica ordenação às listagens. |
| Testes | Testes com Jest verificam modelos, controller e ordenação; o banco é simulado nos testes do controller. |

A separação em classes e responsabilidades ajuda a entender o papel de cada parte e a modificar ou testar o código. O projeto também tem limitações: por exemplo, não possui autenticação, pagamentos, edição de cadastros ou verificação de conflito de horários.

## Estrutura

- `src/models/`: entidades e enums.
- `src/view/` e `src/controller/`: interação pelo terminal e coordenação das operações.
- `src/database/` e `src/interfaces/`: persistência e contrato de acesso aos dados.
- `src/errors/`, `src/utils/` e `src/config/`: erros, utilitários e configuração de entrada.
- `src/tests/`: testes unitários.
- `database/`: arquivo SQLite.

Os requisitos, regras e decisões de escopo estão no [PRD](PRD.md).
