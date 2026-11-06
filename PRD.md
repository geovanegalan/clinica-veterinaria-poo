# PRD — Sistema de Clínica Veterinária

Documento de requisitos do projeto individual da disciplina TSI303 – Programação Orientada a Objetos (UTFPR).

## 1. O que é o projeto

Sistema de gerenciamento de uma clínica veterinária que roda no terminal. Foi escrito em TypeScript (Node.js), guarda os dados em um banco SQLite e tem testes unitários em Jest.

Permite cadastrar donos, veterinários e pets, agendar exames e consultas, e registrar o diagnóstico quando a consulta é realizada.

É o trabalho avaliativo da disciplina de POO: o tema foi livre, mas o sistema precisa aplicar as técnicas de Orientação a Objetos vistas em aula. Cada técnica foi sendo incorporada ao projeto conforme o conteúdo foi apresentado.

## 2. Objetivos

**Do sistema**

- Organizar o cadastro de donos, veterinários e pets de uma clínica.
- Controlar o agendamento e a realização de consultas e exames.
- Manter os dados salvos entre execuções.

**Da disciplina**

- Modelar um problema real com classes, objetos e relacionamentos.
- Aplicar herança, polimorfismo, interfaces, injeção de dependência, exceções, testes e MVC.
- Entregar um sistema funcional, organizado e com boas práticas.

## 3. Usuários

Quem opera a clínica (atendente ou veterinário), usando um menu numérico no terminal. Não há tela gráfica, API nem login.

## 4. Escopo

**Dentro do escopo**

- Cadastro de dono, veterinário e pet.
- Agendamento de consulta ou exame para um pet com um veterinário.
- Realização da consulta com registro de diagnóstico.
- Listagens de donos, veterinários, pets, consultas e de todos os usuários.
- Persistência em SQLite.

**Fora do escopo (decidido para manter o projeto simples)**

- API e interface web.
- Login e autenticação.
- Pagamento.
- Validação de conflito de horários.
- Edição e exclusão de cadastros.

**Planejado para depois**

- Emissão de laudo, sugestão do professor. Exemplo: buscar os pets que fizeram hemograma.

## 5. Requisitos funcionais

| #   | Funcionalidade           | Descrição                                                                 |
| --- | ------------------------ | ------------------------------------------------------------------------- |
| 1   | Cadastrar dono           | Informa nome, email e CPF.                                                |
| 2   | Cadastrar veterinário    | Informa nome, email, CPF e CRMV.                                          |
| 3   | Cadastrar pet            | Informa nome, espécie, idade, CPF do dono e, opcionalmente, um histórico. |
| 4   | Agendar consulta         | Escolhe o pet do dono, o tipo de exame, a data e o veterinário.           |
| 5   | Listar veterinários      | Em ordem alfabética.                                                      |
| 6   | Listar pets              | Em ordem alfabética.                                                      |
| 7   | Listar donos             | Em ordem alfabética.                                                      |
| 8   | Listar consultas         | Mostra protocolo, status, paciente, exame, veterinário e diagnóstico.     |
| 9   | Realizar consulta        | Informa o protocolo e registra o diagnóstico.                             |
| 10  | Listar todos os usuários | Donos e veterinários juntos, cada um com seu papel.                       |
| 11  | Buscar consultas por status | Filtra consultas por AGENDADO, REALIZADO ou CANCELADO.                 |
| 12  | Buscar pets por filtros | Combina espécie opcional com diagnóstico ou tipo de exame realizado.|
| 13  | Cancelar consulta        | Altera o status da consulta para CANCELADO a partir do protocolo.         |

## 6. Regras de negócio

- CPF e email são únicos entre todos os usuários do sistema (donos e veterinários).
- O CRMV de cada veterinário é único.
- Todo pet pertence a um dono que já esteja cadastrado.
- Ao criar um pet, ele passa a constar automaticamente na lista de pets do dono.
- Toda consulta nasce com o status Agendado.
- O diagnóstico só é registrado quando a consulta é realizada, e o status passa a Realizado.
- Dono sem pets não consegue agendar consulta.
- As listagens saem ordenadas (por nome; consultas por tipo de exame).

## 7. Decisões de projeto

- **Sem API:** o sistema é um processo único e a interação é pelo terminal.
- **Sem login e sem pagamento:** foram cortados para manter o escopo enxuto e o foco nos conceitos de POO.
- **Uma classe de banco e um Controller:** o tamanho do projeto não justifica dividir em várias.
- **Sem camada Service:** as regras ficam nos Models e a orquestração no Controller.
- **SQLite no lugar de array em memória:** o professor aprovou a mudança para dar persistência real. Graças à interface e à injeção de dependência, ela foi feita só dentro da `Database`.

## 8. Próximos passos

- Emissão de laudo, com busca por exame realizado (exemplo: pets que fizeram hemograma).


