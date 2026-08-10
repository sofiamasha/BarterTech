# BarterTech

BarterTech e uma plataforma backend de escambo de servicos: pessoas oferecem habilidades e encontram outras pessoas que oferecem aquilo que procuram, sem intermediacao financeira. O projeto foi pensado como portfolio de Java, com foco em regras de negocio e modelagem de dominio em vez de operacoes CRUD.

## Como funciona

Cada `Usuario` mantem os servicos que oferece e uma lista de tipos de servico que procura. Um `Servico` pertence a um unico usuario e pode estar disponivel ou indisponivel. Uma `PropostaTroca` registra quem oferece qual servico, qual servico deseja receber, prazo e condicoes contratuais.

Depois de aceita, uma proposta elegivel pode gerar um `ContratoEscambo`. Cada mudanca de status fica registrada no historico da proposta. Os repositorios em memoria representam a fronteira de persistencia e podem ser substituidos por implementacoes com banco de dados sem alterar o dominio.

## Regra de match

O `MatchService` e independente de qualquer interface de entrada. Para cada par de usuarios ativos, ele verifica os servicos disponiveis:

```text
A oferece design e procura ingles
B oferece ingles e procura design

=> Match(A, B, design, ingles)
```

O algoritmo retorna somente combinações reciprocas e ignora usuarios inativos ou servicos indisponiveis.

## Regras de negocio

- Os dois participantes precisam estar ativos.
- Os servicos devem pertencer aos participantes corretos, estar disponiveis e satisfazer os interesses reciprocos.
- A proposta precisa estar dentro do prazo para ser criada, aceita ou convertida em contrato.
- Um contrato so e emitido para proposta aceita.
- Toda condicao obrigatoria deve estar marcada como atendida antes da emissao do contrato.
- Violacoes usam excecoes especificas: `UsuarioInativoException`, `ServicoIndisponivelException`, `PropostaExpiradaException` e `TrocaInvalidaException`.

## Integridade do contrato

O conteudo canonico do contrato e processado por SHA-256. O hash resultante permite detectar alteracoes no conteudo: ao recalcular o hash, o valor deve coincidir com o armazenado. Isso **nao e uma assinatura digital**: nao ha certificado, chave privada, identidade criptografica ou nao repudio.

## Arquitetura

```text
src/main/java/br/com/bartertech/
  domain/       Entidades, estados e contratos de dominio
  service/      Match, validacao de propostas e SHA-256
  repository/   Abstracao e implementacao em memoria
  exception/    Excecoes de regra de negocio
  application/  Ponto de entrada de demonstracao
src/test/java/  Testes unitarios JUnit 5
```

O projeto usa encapsulamento (estado mutavel protegido por metodos), composicao (`Usuario` contem servicos e interesses), enums para estados, interface para a estrategia de integridade e responsabilidade unica entre dominio, regras e persistencia.

## Executar

Requer Java 17 ou superior e Maven 3.9 ou superior.

```bash
mvn clean test
mvn exec:java
```

O segundo comando demonstra dois usuarios, um match reciproco, a criacao de uma proposta e a geracao do contrato.

## Testes

```bash
mvn test
```

A suite cobre criacao de usuario, cadastro de servico, match e ausencia de match, proposta invalida, servico indisponivel, usuario inativo, prazo de proposta, contrato, condicoes obrigatorias e verificacao do hash.

## Limitacoes e evolucoes

Esta versao usa memoria, nao possui autenticacao nem API HTTP e trata tipos de servico por texto normalizado. Evolucoes naturais incluem repositorios JPA, endpoints REST, categorias controladas, notificacoes, auditoria de transicoes de status e uma assinatura digital real quando houver requisito de autenticidade.
