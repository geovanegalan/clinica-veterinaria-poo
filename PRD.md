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
| 12  | Buscar pets por diagnóstico | Busca pets a partir de palavras-chave no diagnóstico (case-insensitive).|
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

## 7. Arquitetura

O sistema segue o padrão MVC. A View nunca conversa direto com o Model ou com o banco: tudo passa pelo Controller.

| Camada       | Papel                                                                                                                                | Onde está                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| View         | Mostra o menu, coleta o que o usuário digita e exibe resultados e erros. Não tem regra de negócio.                                   | `MainScreen`                                                    |
| Controller   | Recebe o pedido da View, valida regras que dependem do conjunto de dados (duplicidade, existência), cria os objetos e chama o banco. | `MainController`                                                |
| Model        | Entidades do domínio com seus dados e regras próprias.                                                                               | `User`, `PetOwner`, `Veterinarian`, `Pet`, `Appointment`, enums |
| Persistência | Guarda e busca os dados no SQLite. Implementa a interface `IDatabase`.                                                               | `Database`                                                      |

**Estrutura de pastas:** `models/`, `controller/`, `views/`, `database/`, `interfaces/`, `errors/`, `utils/`, `config/` e `tests/`.

**Montagem do sistema (injeção de dependência):** o ponto de entrada cria a `Database`, entrega ao `MainController`, que é entregue à `MainScreen`, e só então o menu é iniciado.

**Exemplo de fluxo, cadastrar dono:**

1. A View coleta nome, email e CPF.
2. A View chama `controller.createPetOwner(...)`.
3. O Controller pergunta ao banco se o email e o CPF já existem. Se existirem, lança `DuplicateDataError`.
4. Se estiver tudo certo, o Controller cria o `PetOwner` e manda o banco salvar.
5. A View exibe a mensagem de sucesso ou de erro.

## 8. Modelo de dados

| Entidade        | Atributos principais                                | Relacionamentos                       |
| --------------- | --------------------------------------------------- | ------------------------------------- |
| User (abstrata) | nome, CPF, email                                    | Base de `PetOwner` e `Veterinarian`.  |
| PetOwner        | herda de User                                       | Tem vários `Pet`.                     |
| Veterinarian    | herda de User, mais CRMV                            | Atende várias `Appointment`.          |
| Pet             | nome, espécie, idade, histórico (opcional)          | Pertence a um `PetOwner`.             |
| Appointment     | protocolo, status, tipo de exame, data, diagnóstico | Associa um `Pet` e um `Veterinarian`. |

**Enums:** `ExamType` (rotina, hemograma, bioquímico, raio-x, ultrassonografia, entre outros) e `Status` (agendado, realizado, cancelado).

**Tabelas SQLite:** `pet_owners`, `veterinarians`, `pets` e `appointments`, com chaves estrangeiras ligando pet ao dono e consulta ao pet e ao veterinário.

## 9. Critérios de avaliação e como o projeto os atende

| Critério                                         | O que é                                                                                              | Onde foi aplicado                                                                                                                                                                       | Por que                                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Classificação e associação entre classes         | Identificar as entidades do problema e como elas se relacionam, guardando referências entre objetos. | `Pet` ↔ `PetOwner` (relação nos dois sentidos, sincronizada no construtor do `Pet`); `Appointment` associa `Pet` e `Veterinarian`.                                                      | Modela o mundo real: um dono tem pets, uma consulta envolve um pet e um veterinário.                                                  |
| Herança                                          | Uma classe reaproveita atributos e comportamentos de outra.                                          | `PetOwner` e `Veterinarian` herdam de `User`.                                                                                                                                           | Nome, CPF e email são comuns aos dois, e escrever uma vez evita repetição.                                                            |
| Classe abstrata                                  | Classe que não pode ser instanciada e serve de base, podendo exigir métodos das filhas.              | `User` é abstrata e declara o método abstrato `showData()`.                                                                                                                             | Não existe usuário genérico no sistema, só donos e veterinários.                                                                      |
| Sobrescrita e polimorfismo                       | A filha redefine um método herdado, e o código usa o objeto sem saber qual é a classe real.          | `showData()` e `getRole()` são sobrescritos em `PetOwner` e `Veterinarian`. A listagem de todos os usuários chama `getRole()` de cada um sem distinguir o tipo.                         | O mesmo comando produz comportamentos diferentes conforme o objeto.                                                                   |
| Interface                                        | Contrato que define quais métodos uma classe deve ter, sem implementação.                            | `IDatabase`, implementada por `Database`.                                                                                                                                               | O Controller depende do contrato, não da classe concreta. Trocar de array em memória para SQLite não alterou o Controller nem a View. |
| Injeção de dependência                           | A classe recebe suas dependências de fora, em vez de criá-las.                                       | `MainController` recebe `IDatabase` no construtor, `MainScreen` recebe o `MainController`, e o ponto de entrada monta tudo.                                                             | Reduz acoplamento e permite usar uma versão falsa nos testes.                                                                         |
| Enum                                             | Conjunto fixo de valores nomeados.                                                                   | `ExamType` e `Status`.                                                                                                                                                                  | Evita textos soltos e garante que só valores válidos sejam usados.                                                                    |
| Sobrecarga                                       | Um método com mais de uma assinatura.                                                                | `createPet` no Controller, com e sem histórico.                                                                                                                                         | Cadastrar o pet com ou sem observação usando o mesmo nome de método.                                                                  |
| Try-catch e exceção personalizada                | Tratar erros esperados com classes de erro próprias.                                                 | `DuplicateDataError` (guarda o campo e o valor repetidos), `EntityNotFoundError`, `OwnerHasNoPetsError`, `AppointmentNotFound` e `DatabaseErrorNoId`, tratadas com `try/catch` na View. | O erro carrega informação sobre o que deu errado, e o usuário recebe mensagens claras sem o programa quebrar.                         |
| MVC e comunicação via Controller                 | Separar View, Controller e Model, sem a View acessar dados diretamente.                              | `MainScreen` só fala com o `MainController`, que fala com `IDatabase` e com os Models.                                                                                                  | Cada camada tem uma responsabilidade, o que facilita manter e testar.                                                                 |
| Gerenciamento de persistência, busca e ordenação | Guardar dados e implementar a lógica de busca e de ordenação.                                        | Banco SQLite na classe `Database`, com métodos de busca (`findOwnerByCpf`, `findVetByCrmv`, `cpfExists`, `getAppointmentsByStatus`, `findPetsByDiagnosis` e outros) e listagens ordenadas pelo Controller. | Os dados sobrevivem entre execuções e a lógica de encontrar e ordenar está no código.                                                 |
| Tipos genéricos                                  | Funções e classes que funcionam com qualquer tipo, mantendo a checagem de tipos.                     | `sortList<T>` em `utils`, usada para ordenar donos, veterinários, pets e consultas.                                                                                                     | Uma só função serve a todos os tipos, em vez de uma por entidade.                                                                     |
| Testes                                           | Verificar automaticamente se o código se comporta como esperado.                                     | Testes unitários com Jest para Models, Controller (com mock do `IDatabase`) e `sortList`.                                                                                               | Protegem as regras de negócio contra erros futuros.                                                                                   |
| Inovações e boas práticas                        | Recursos além do mínimo pedido.                                                                      | Persistência em SQLite real com chaves estrangeiras, campos únicos no banco, validação das escolhas do menu, encapsulamento com atributos privados, mensagens de erro específicas.      | Deixa o sistema mais robusto e próximo de um projeto real.                                                                            |
| Qualidade do projeto                             | Organização, nomes consistentes e código legível.                                                    | Pastas por responsabilidade, nomes em camelCase e PascalCase, sem lógica de negócio na View.                                                                                            | Facilita ler, manter e evoluir o sistema.                                                                                             |

## 10. Testes

Os testes usam Jest e são unitários. Para o Controller, o `IDatabase` é substituído por um objeto falso (mock), então nenhum teste toca o banco real.

- **Models:** estado inicial, associação `Pet` ↔ dono, métodos sobrescritos (`getRole`, `showData`) e status inicial da consulta.
- **Controller:** cadastro com sucesso, erros de duplicidade (CPF, email e CRMV), dono inexistente, dono sem pets, realização de consulta e listagem de usuários.
- **Utilitário:** `sortList` com números e com letras.

Para rodar: `npm test`.

## 11. Tecnologias

- TypeScript e Node.js (22 ou superior)
- SQLite nativo do Node (`node:sqlite`)
- Jest e ts-jest para os testes
- prompt-sync para a entrada no terminal

## 12. Decisões de projeto

- **Sem API:** o sistema é um processo único e a interação é pelo terminal.
- **Sem login e sem pagamento:** foram cortados para manter o escopo enxuto e o foco nos conceitos de POO.
- **Uma classe de banco e um Controller:** o tamanho do projeto não justifica dividir em várias.
- **Sem camada Service:** as regras ficam nos Models e a orquestração no Controller.
- **SQLite no lugar de array em memória:** o professor aprovou a mudança para dar persistência real. Graças à interface e à injeção de dependência, ela foi feita só dentro da `Database`.

## 13. Próximos passos

- Emissão de laudo, com busca por exame realizado (exemplo: pets que fizeram hemograma).
- Cancelamento de consulta pelo menu.
