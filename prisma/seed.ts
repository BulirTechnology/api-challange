import { BcryptHasher } from "../src/infra/cryptography/bcrypt-hasher";
import { PrismaClient, CreditPackage, QuestionType } from "@prisma/client";
import { SubscriptionPlanStatus } from "@/domain/subscriptions/enterprise/subscription-plan";

const prisma = new PrismaClient();
const bcryptHasher = new BcryptHasher();

//#region initial config

const categories = [
  {
    title: "Serviços Domesticos",
    priority: 1,
    subcategories: [
      {
        title: "Limpeza",
        hasSubcategory: false,
        services: [
          {
            title: "Limpeza profunda, desinfestação e jardinagem",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title:
              "Aspiração geral (casa/escritório), lavagem de ( tapetes, carpetes,sofás, cadeiras, colchões, técidos sensíveis, cortinas sem retirar, interior de viaturas, vidros, industriais, limpeza doméstica",

            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title: "Estofos e Mobília",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title:
              "Limpeza de ( tapete, sofás, interior de viaturas, pós obras, geral e tanque de águas ), manutenção de ar-condicionado e desinfestação",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title:
              "Aspiração, Remoção de ácaros, Higienização e Limpeza de ( Sofás, Tapetes, Cadeiras, Cortinas, Colchões e Interior de viaturas ), Residencial e Comercial",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title:
              " Limpezas e Manutenção/Contrato, Limpezas Eventuais, Limpezas Pré-mudança/Pós-Obra/Pós-Eventos E Lavandarias Industriais e Self-Service",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title:
              "Limpeza geral de residências, organização de interior e exterior, assessoria a governantas, diarista, engomadeira, empregada doméstica e limpador de vidros",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title: "Lavagem de sofá colchão ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title: "Remoção de Lixo",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title: "Empregada Doméstica",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
          {
            title: "Jardineiros",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de serviço que você deseja agendar?",
                options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
                options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
              },
              {
                type: "BOOLEAN",
                title: "Você possui animais de estimação na propriedade?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Reformas",
        hasSubcategory: false,
        services: [
          {
            title: "Reformas de Casa",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o prazo que você tem em mente para completar as reformas?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de reforma que você está buscando?",
                options: [
                  "Renovação da Cozinha",
                  "Remodelação do Banheiro",
                  "Ampliação de Espaços",
                  "Reparos Gerais",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais características você gostaria de incluir na reforma?",
                options: [
                  "Pintura de paredes",
                  "Instalação de novos pisos",
                  "Substituição de luminárias",
                  "Adição de armários embutidos",
                ],
              },
              {
                type: "BOOLEAN",
                title: "Você já possui um projeto ou plano para as reformas?",
                options: [],
              },
            ],
          },
          {
            title: "Remodelação de Loja",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Qual é o prazo que você tem em mente para completar as reformas?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o tipo principal de reforma que você está buscando?",
                options: [
                  "Renovação da Cozinha",
                  "Remodelação do Banheiro",
                  "Ampliação de Espaços",
                  "Reparos Gerais",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais características você gostaria de incluir na reforma?",
                options: [
                  "Pintura de paredes",
                  "Instalação de novos pisos",
                  "Substituição de luminárias",
                  "Adição de armários embutidos",
                ],
              },
              {
                type: "BOOLEAN",
                title: "Você já possui um projeto ou plano para as reformas?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Pavimentos",
        hasSubcategory: false,
        services: [
          {
            title: "Aplicação de piso vinílio",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title:
              "Pintura, Polimento de pavimento de Madeira, Portas e Janelas, Carpintaria e Canalização / Electricidade",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title:
              "Reparação ou Substituição de Pavimento em Ladrilho ou Pedra",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title: "Aplicação de Pisos Epóxi, Aplicação de Porcelanato Líquido",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title:
              "Reparação ou Substituição de Pavimento em Ladrilho ou Pedra",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title:
              "Aplicação de Pavimento em Madeira; Construções, Reformas e Manutenção; Pisos; Industriais e residenciais, Piso flutuante (Madeira)",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title: "Reparação ou Substituição de Pavimento em Ladrilho",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title: "Aplicação de Pavimento em Madeira",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
          {
            title:
              " Reparação ou Substituição de Pavimento em Ladrilho ou Pedra",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja instalar o piso vinílico?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Quais são suas preferências de estilo para o piso vinílico?",
                options: ["Madeira", "Pedra", "Liso", "Azulejo"],
              },
              {
                type: "BOOLEAN",
                title: "Você precisa de remoção e descarte do piso antigo?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Paredes, Pladur e Escadas",
        hasSubcategory: false,
        services: [
          {
            title: "Aplicação de Papel de Parede",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Instalação, Reparação ou Remoção de Revestimento de Parede",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Construção de Paredes de Pladur",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Paisagismo e Jardinagem",
        hasSubcategory: false,
        services: [
          {
            title: "Manutenção de jardim",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Construção de jardim, Manutenção mensal de jardim , Recuperação de jardim e Combate de pragas do jardim",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Jardinagem, jardim vertical artificial, manutenção de áreas verdes, aplicação de relvas, controlo de pragas, projectos paisagísticos",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Decoração, Plantação, Vendas, Manutenção e Consultoria",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Criação e Manutenção",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Paisagismo",
        hasSubcategory: false,
        services: [
          {
            title: "Design de Exterior",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Plantação de relva",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Plantação ou fornecimento de relva",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Criação de Jardins, Manutenção de Jardins, Controlo de Pragas( Eliminação de bactérias, e outros tipos de praga), Vendemos Qualquer tipo de plantas .( Palmeiras, Crotos,Roseiras), Preparação e Manutenção da terra",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Relva Sintética e Jardins Verticais",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Relva, Jardinagem ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Pavimentos Flutuante",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Aplicação de Pavimento ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Vasos e Buquês de flores",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Instalção de Sistema de Rega Gota a Gota",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Reparação ou Substituição de Pavimento em Ladrilho ou Pedra",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Aplicação de Relva Sintética e Aplicação de Pavimento Fluctuante",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Reparação ou Substituição de Pavimento",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Aplicação de Relva Artificial",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Assistência Técnica",
    priority: 2,
    subcategories: [
      {
        title: "Electricidade, Canalização e Frio",
        hasSubcategory: false,
        services: [
          {
            title:
              "Serviços de assistência técnica nos ramos de eletricidade, canalização, climatização, antena Parabólica ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Montagem, Manutenção, Reparação de AC ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Reparação de máquina de lavar roupa, arca, geleira ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Electrodomésticos",
        hasSubcategory: false,
        services: [
          {
            title:
              "Montagem, Reparação e Manutenção de todo tipo de Máquina de lavar roupa ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Reparação de máquina de lavar roupa, arca, geleira ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Reparação e manutenção de Electrodoméstico",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title:
              "Reparação e Manutenção de todo tipo de máquina de lavar roupa automática e industrial",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Montagem De Antena Parabólica",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Electricidade",
        hasSubcategory: false,
        services: [
          {
            title: "Problemas Elétricos e de Cabos",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: " Instalação de Ventoinha",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Electricidade Residencial ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Montagem de antena e parabólica, Montagen de Led ",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Eventos e Decoração",
    priority: 3,
    subcategories: [
      {
        title: "Catering",
        hasSubcategory: false,
        services: [
          {
            title: "Chefe de cozinha e Formatação",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Bolos e Cakes",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Decoração",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Escola e Grupo de Dança",
        hasSubcategory: false,
        services: [
          {
            title: "Para eventos e aulas de dança",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
      {
        title: "Florista",
        hasSubcategory: false,
        services: [
          {
            title: "Arranjos e buquês, Flores para eventos e decoração",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
          {
            title: "Buquês rosas, Boxes de rosas",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Transportes e Mudanças",
    priority: 4,
    subcategories: [
      {
        title: "Mudança",
        hasSubcategory: false,
        services: [
          {
            title: "Transporte de Móveis",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Cursos e Aulas",
    priority: 5,
    subcategories: [
      {
        title: "Formação",
        hasSubcategory: false,
        services: [
          {
            title: "Curso de Gestão de Carreira",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Reformas e Construção",
    priority: 6,
    subcategories: [
      {
        title: "Móveis e Decoração",
        hasSubcategory: false,
        services: [
          {
            title:
              "Casas, especializados em revestimento em espelhos e vidros e mercenaria",
            questions: [
              {
                type: "SIMPLE",
                title:
                  "Quando você gostaria que a instalação do piso vinílico fosse concluída?",
                options: [],
              },
              {
                type: "SINGLE_SELECT",
                title:
                  "Qual é o ambiente principal onde você deseja aplicar o papel de parede?",
                options: [
                  "Sala de estar",
                  "Quarto(s)",
                  "Cozinha",
                  "Banheiro(s)",
                ],
              },
              {
                type: "MULTIPLE_SELECT",
                title:
                  "Você gostaria de aplicar papel de parede em todas as paredes ou apenas em uma parede de destaque?",
                options: ["Todas as paredes", "Apenas uma parede"],
              },
              {
                type: "BOOLEAN",
                title:
                  "As paredes estão preparadas e livres de quaisquer irregularidades para a aplicação do papel de parede?",
                options: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const listReasonForJobDispute = [
  "O trabalho não foi entregue dentro do prazo acordado.",
  "O resultado final não atende às expectativas de qualidade",
  "O freelancer não responde às mensagens",
  "O trabalho entregue não corresponde ao que foi descrito na proposta inicial.",
  "O freelancer não cumpriu com os termos e condições estabelecidos pelo aplicativo.",
];

const listJobCancelReason = [
  "Mudança de requisitos",
  "Conflito de agenda",
  "Problemas de comunicação",
  "Incapacidade de cumprir prazos",
  "Desacordo sobre os termos",
];

const quotationRejectReason = [
  "Preço muito alto",
  "Falta de experiência relevante",
  "Prazo de entrega inadequado",
  "Falta de detalhes na proposta",
  "Falta de confiança",
  "Não alinhamento com os objetivos do projeto",
];

const taskDeleteReason = [
  "Tarefa duplicada",
  "Irrelevante para o projeto",
  "Mudança de prioridade",
  "Conclusão por outros meios",
  "Erro de entrada",
  "Fora do escopo do projeto",
];

const subscriptionsPlan = [
  {
    benefits: [
      "10 créditos gratuitos por mês, onde 1 crédito = 1 trabalho.",
      "Créditos adicionais podem ser adquiridos sob demanda conforme o plano disponível com cobrança de comissão.",
      "Apenas 70 créditos podem ser transferidos para o próximo mês do calendário.",
      "Comissão de 15% sobre serviços de 0,00 a 10.000,00 kwanzas.",
      "Comissão de 10% sobre serviços de 10.000,00 a 50.000,00 kwanzas.",
      "Comissão de 5% sobre serviços de 50.001,00 kwanzas ou mais.",
    ],
    createdAt: new Date(),
    creditsPerJob: 2,
    description: "Plano basico",
    discountType: "TIERED",
    discountValue: 0,
    duration: 31,
    isDefault: true,
    name: "BASICO",
    price: 0,
    rollOverCredit: 70,
    status: "ACTIVE",
    updatedAt: new Date(),
    discountsCommission: [
      {
        minValue: 0,
        maxValue: 10000,
        commission: 15,
      },
      {
        minValue: 10001,
        maxValue: 50000,
        commission: 10,
      },
      {
        minValue: 50001,
        maxValue: 9999999999,
        commission: 5,
      },
    ],
  },
  {
    benefits: [
      "70 créditos gratuitos por mês, onde 1 crédito = 1 trabalho, por 7.990 kwanzas por mês.",
      "Créditos adicionais podem ser adquiridos sob demanda conforme o plano disponível.",
      "Comissão fixa de 5% sobre o serviço.",
      "Apenas 140 créditos podem ser transferidos para o próximo mês do calendário.",
    ],
    createdAt: new Date(),
    discountsCommission: [],
    creditsPerJob: 2,
    description: "",
    discountType: "FIXED",
    discountValue: 5,
    duration: 31,
    isDefault: false,
    name: "PREMIUM",
    price: 7500,
    rollOverCredit: 140,
    status: "ACTIVE",
    updatedAt: new Date(),
  },
];

const creditsPackage: CreditPackage[] = [
  {
    amount: 500,
    id: "12",
    createdAt: new Date(),
    name: "10 Credits",
    status: "ACTIVE",
    totalCredit: 10,
    updatedAt: new Date(),
    vat: 70,
  },
  {
    amount: 2000,
    id: "1",
    createdAt: new Date(),
    name: "40 Credits",
    status: "ACTIVE",
    totalCredit: 40,
    updatedAt: new Date(),
    vat: 280,
  },
  {
    amount: 3500,
    id: "12",
    createdAt: new Date(),
    name: "70 Credits",
    status: "ACTIVE",
    totalCredit: 70,
    updatedAt: new Date(),
    vat: 490,
  },
];

//#endregion

//#region functions

async function newPlan() {
  const plan = {
    benefits: [
      "70 créditos gratuitos por mês, onde 1 crédito = 1 trabalho, por 7.990 kwanzas por mês.",
      "Créditos adicionais podem ser adquiridos sob demanda conforme o plano disponível.",
      "Comissão fixa de 5% sobre o serviço.",
      "Apenas 140 créditos podem ser transferidos para o próximo mês do calendário.",
    ],
    createdAt: new Date(),
    discountsCommission: [],
    creditsPerJob: 2,
    description: "",
    discountType: "FIXED",
    discountValue: 5,
    duration: 31,
    isDefault: false,
    name: "PREMIUM",
    price: 7500,
    rollOverCredit: 140,
    status: "ACTIVE",
    updatedAt: new Date(),
  };

  await prisma.subscriptionPlan.create({
    data: {
      creditsPerJob: plan.creditsPerJob,
      description: plan.description,
      duration: plan.duration,
      name: plan.name,
      price: plan.price,
      rollOverCredit: plan.rollOverCredit,
      status: "ACTIVE",
      benefits: plan.benefits,
      isDefault: false,
      discountType: "FIXED",
      discountValue: plan.discountValue,
    },
  });

  const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      isDefault: true,
    },
  });

  if (!subscriptionPlan) return;

  await prisma.subscription.deleteMany({});

  const sps = await prisma.serviceProvider.findMany();

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + subscriptionPlan.duration);

  for (let sp of sps) {
    await prisma.subscription.create({
      data: {
        endDate: endDate,
        serviceProviderId: sp.id,
        status: "ACTIVE",
        createdAt: new Date(),
        startDate: new Date(),
        subscriptionPlanId: subscriptionPlan.id,
      },
    });
  }
}

async function buildCategories() {
  const CATEGORIES = [
    {
      value: "Serviços Domésticos",
      priority: 1,
      subcategories: [
        {
          id: "11",
          name: "Apoio ao Domícilio",
          subSubCategories: [
            {
              id: "111",
              name: "Babá",
            },
            {
              id: "112",
              name: "Cuidados para Idosos",
            },
          ],
        },
        {
          id: "12",
          name: "Limpeza",
          subSubCategories: [
            {
              id: "123",
              name: "Empregada Doméstica (Diarista)",
            },
            {
              id: "124",
              name: "Limpeza de Escritório",
            },
            {
              id: "125",
              name: " Limpeza de Colchão",
            },
            {
              id: "126",
              name: "Limpeza de Cortinas",
            },
            {
              id: "127",
              name: "Espaço Comercial",
            },
            {
              id: "128",
              name: "Estofos e Mobília",
            },
            {
              id: "129",
              name: "Limpeza de Tapetes",
            },
            {
              id: "1299",
              name: "Remoção de Lixo",
            },
          ],
        },
        {
          id: "13",
          name: "Desinfestação e Controlo de Pragas",
          subSubCategories: [],
        },
        {
          id: "14",
          name: "Lavagem de Roupa e Engomadoria",
          subSubCategories: [],
        },
        {
          id: "15",
          name: "Beleza & Cuidados",
          subSubCategories: [
            {
              id: "151",
              name: "Cabelereiro",
            },
            {
              id: "152",
              name: "Maquilhagem",
            },
            {
              id: "153",
              name: "Penteados para Eventos",
            },
            {
              id: "154",
              name: "Manicure e Pedicure",
            },
            {
              id: "155",
              name: "Depilação",
            },
            {
              id: "156",
              name: "Corte de Cabelo",
            },
            {
              id: "157",
              name: "Tatuadores",
            },
          ],
        },
        {
          id: "16",
          name: "Bem-Estar",
          subSubCategories: [
            {
              id: "160",
              name: "Massagem Desportiva",
            },
            {
              id: "161",
              name: "Massagem para Grávidas",
            },
            {
              id: "162",
              name: "Massagem Terapêutica",
            },
            {
              id: "163",
              name: "Massagem relaxante",
            },
            {
              id: "164",
              name: "Drenagem Linfática",
            },
            {
              id: "165",
              name: "Limpeza Facial",
            },
          ],
        },
        {
          id: "17",
          name: "Paisagismo",
          subSubCategories: [
            {
              id: "170",
              name: "Plantação de Relva",
            },
            {
              id: "161",
              name: "Podagem de Relva",
            },
            {
              id: "162",
              name: "Podagem de Árvores",
            },
            {
              id: "163",
              name: "Aplicação de Relva Artifical",
            },
            {
              id: "164",
              name: "Instalação de Sistema de Irrigação",
            },
            {
              id: "165",
              name: "Manutenção de Sistema de Irrigação",
            },
            {
              id: "167",
              name: "Instalação de Sistema de Rega Gota a Gota",
            },
            {
              id: "168",
              name: "Manutenção de Sistem de Rega Gota a Gota",
            },
            {
              id: "169",
              name: "Nivelação de Terreno de Grande Dimensão (Mais de 1 hectar)",
            },
          ],
        },
        {
          id: "18",
          name: "Alfaiate & Costura",
          subSubCategories: [
            {
              id: "181",
              name: "Vestido de Casamento",
            },
            {
              id: "182",
              name: "Vestido, Calças e Camisas",
            },
          ],
        },
      ],
    },
    {
      value: "Assistência Técnica",
      priority: 2,
      subcategories: [
        {
          id: "131",
          name: "Climatização",
          subSubCategories: [
            {
              id: "1311",
              name: "Manutenção ou Reparação de Geleiras",
            },
            {
              id: "1312",
              name: "Manutenção ou Reparação de Câmeras Frigorificas",
            },
            {
              id: "1313",
              name: "Instalação de Ar Condicionado",
            },
            {
              id: "1314",
              name: "Manutenção e Reparação de Ar Condicionado",
            },
          ],
        },
        {
          id: "132",
          name: "Ventilação",
          subSubCategories: [
            {
              id: "1321",
              name: "Instalação ou Substituição de Exaustores",
            },
            {
              id: "1322",
              name: "Reparação ou Substituição de Exaustor de Casa de Banho",
            },
          ],
        },
        {
          id: "133",
          name: "Iluminação",
          subSubCategories: [
            {
              id: "1331",
              name: "Instalação de Candeeiros ou Lâmpadas",
            },
          ],
        },
        {
          id: "134",
          name: "Electricidade",
          subSubCategories: [
            {
              id: "1331",
              name: "Instalação ou Reparação de Interruptores, Tomadas",
            },
            {
              id: "1332",
              name: "Reparação de Disjuntor ou Caixa de Fusíveis",
            },
            {
              id: "1333",
              name: "Instalação de Disjuntor ou Caixa de Fusíveis",
            },
            {
              id: "1334",
              name: "Instalação de Gerador",
            },
            {
              id: "1335",
              name: "Manutenção ou Reparação de Geradores",
            },
            {
              id: "1336",
              name: "Problemas Eléctricos e de Cabos",
            },
            {
              id: "137",
              name: "Instalação de Ventoinha",
            },
            {
              id: "1338",
              name: "Instalar ou Reparar Intercomunicadores",
            },
            {
              id: "1339",
              name: "Automação Residencial (Domótica)",
            },
            {
              id: "1340",
              name: "Fiação de Cabos",
            },
            {
              id: "1341",
              name: "Instalação ou Reparação de Portões Electricos",
            },
          ],
        },
        {
          id: "135",
          name: "Electrodomésticos",
          subSubCategories: [
            {
              id: "1351",
              name: "Antena Parabólica",
            },
            {
              id: "1352",
              name: "Instalação de Electrodomésticos",
            },
            {
              id: "1353",
              name: "Reparar Aspirador",
            },
            {
              id: "1354",
              name: "Reparar Cortador de Relva",
            },
            {
              id: "1355",
              name: "Consertar Eletrodomésticos",
            },
          ],
        },
        {
          id: "136",
          name: "Fogões e Fornos",
          subSubCategories: [
            {
              id: "1361",
              name: "Manutenção ou Reparação de Fogão e Forno",
            },
          ],
        },
        {
          id: "137",
          name: "Canalização",
          subSubCategories: [
            {
              id: "1361",
              name: "Instalação ou Substituição de Bomba de Água",
            },
            {
              id: "1362",
              name: "Desentupimento de Canos ou Fossa Séptica",
            },
            {
              id: "1363",
              name: "Projectos de Canalização",
            },
            {
              id: "1364",
              name: "Canos Furados ou Problemas com Torneiras",
            },
            {
              id: "1365",
              name: "Instalação ou Reparação de Banheira e Chuveiro",
            },
            {
              id: "1366",
              name: "Instalação ou Reparação de Lavatório e Torneira",
            },
            {
              id: "1367",
              name: "Instalação ou Substituição de Sanita",
            },
            {
              id: "1368",
              name: "Instalação ou Reparação de Tubos de Canalização",
            },
            {
              id: "1369",
              name: "Instalação ou Reparação de Canalização Exterior",
            },
            {
              id: "1370",
              name: "Reparação ou Manutenção de Fossa Séptica",
            },
          ],
        },
        {
          id: "137",
          name: "Impermebialização",
          subSubCategories: [
            {
              id: "1372",
              name: "Projectos de Impermebialização",
            },
          ],
        },
        {
          id: "138",
          name: "Janelas e Portas",
          subSubCategories: [
            {
              id: "1381",
              name: "Instalação ou Reparação de Caxilharia",
            },
            {
              id: "1382",
              name: "Instalação ou Reparação de Janelas de PVC",
            },
            {
              id: "1383",
              name: "Instalação ou Reparação de Portas Blindadas",
            },
            {
              id: "1384",
              name: "Instalação ou Reparação de Janelas",
            },
            {
              id: "1385",
              name: "Instalação ou Reparação de Portas",
            },
            {
              id: "1386",
              name: "Instalação de Estores ou Pesianas",
            },
            {
              id: "1385",
              name: "Reparação ou Substituiçã de Estores ou Persianas",
            },
          ],
        },
        {
          id: "139",
          name: "Vidraceiros",
          subSubCategories: [
            {
              id: "1391",
              name: "Instalação ou Reparação de Vidros ou Espelhos",
            },
          ],
        },
        {
          id: "1399",
          name: "Serralharia e Portões",
          subSubCategories: [
            {
              id: "13991",
              name: "Instalação ou Reparação de Grades e Vedações",
            },
            {
              id: "13992",
              name: "Instalação de Porta para Animais de Estimação",
            },
            {
              id: "13993",
              name: "Instalação ou Remodelação de Gradeamento",
            },
            {
              id: "13994",
              name: "Instalação ou Reparação de Portões",
            },
            {
              id: "13995",
              name: "Instalação ou Reparação de Portões de Garagem",
            },
            {
              id: "13996",
              name: "Projectos de serralharia",
            },
          ],
        },
        {
          id: "140",
          name: "Telhados e Coberturas",
          subSubCategories: [
            {
              id: "141",
              name: "Instalação ou Substituição de Telhado",
            },
            {
              id: "142",
              name: "Limpeza de Techado",
            },
            {
              id: "143",
              name: "Reparação ou Manutenção de Telhado",
            },
            {
              id: "144",
              name: "Instalação de Toldos",
            },
            {
              id: "145",
              name: "Manutenção e Reparação de Toldos",
            },
          ],
        },
        {
          id: "150",
          name: "Estofador",
          subSubCategories: [
            {
              id: "151",
              name: "Reparação de Estofos",
            },
            {
              id: "152",
              name: "Restauro, Tratamento e Reparação de Couro",
            },
          ],
        },
        {
          id: "160",
          name: "Pintura",
          subSubCategories: [
            {
              id: "161",
              name: "Pintura Exterior",
            },
            {
              id: "162",
              name: "Pintura de Armários",
            },
            {
              id: "163",
              name: "Pintura de Interiores",
            },
            {
              id: "164",
              name: "Pintura de Portas",
            },
          ],
        },
        {
          id: "170",
          name: "Piscinas, Saunas e Hidromassagem",
          subSubCategories: [
            {
              id: "171",
              name: "Instalação de Jacuzzi e Spa",
            },
            {
              id: "172",
              name: "Instalação de Suana",
            },
            {
              id: "173",
              name: "Manutenção ou Reparação de Jacuzzi e Spa",
            },
            {
              id: "173",
              name: "Manutenção ou Reparação de piscina",
            },
            {
              id: "171",
              name: "Manutenção ou Reparação de Sauna",
            },
          ],
        },
        {
          id: "180",
          name: "Alarmes e CCTV",
          subSubCategories: [
            {
              id: "181",
              name: "Instalação de Alarme e Segurança Dominiliária",
            },
            {
              id: "182",
              name: "Instalar e Reparar Câmaras de Vigilância",
            },
            {
              id: "183",
              name: "Reparação ou Ajuste de Alarme",
            },
            {
              id: "184",
              name: "Instalação ou Reparação de Alarmes em Veículos",
            },
          ],
        },
        {
          id: "190",
          name: "Multimedia",
          subSubCategories: [
            {
              id: "191",
              name: "Instalação e Configuração de Router",
            },
            {
              id: "192",
              name: "Reparação de Computadores",
            },
            {
              id: "193",
              name: "Reparação de Câmera Fotográfica",
            },
            {
              id: "194",
              name: "Reparação de Impressora e Fotocopiadoras",
            },
            {
              id: "195",
              name: "Reparação de Instrumentos Musicais",
            },
            {
              id: "196",
              name: "Reparação de Máquinas de Venda Automºatica",
            },
            {
              id: "197",
              name: "Reparação de Projectores",
            },
            {
              id: "198",
              name: "Reparação de Relógios",
            },
            {
              id: "199",
              name: "Reparação de TV",
            },
            {
              id: "1991",
              name: "Reparação de Telemóvel ou Tablet",
            },
            {
              id: "1991",
              name: "Serviço de Recuperação de dados",
            },
            {
              id: "1992",
              name: "Instalação ou Reparação de Som ambiente",
            },
            {
              id: "1993",
              name: "Montagem ou Desmontagem de Mobiliário",
            },
            {
              id: "1994",
              name: "Restauração de Mobília",
            },
            {
              id: "1995",
              name: "Montagem de Suporte para TV",
            },
          ],
        },
        {
          id: "1900",
          name: "Veículos",
          subSubCategories: [
            {
              id: "19001",
              name: "Manutenção Periódica",
            },
            {
              id: "19002",
              name: "Leitura de Diagnóstico",
            },
            {
              id: "19003",
              name: "Reparação de Veículos",
            },
            {
              id: "19004",
              name: "Manutenção de Ar Condicionado",
            },
            {
              id: "19005",
              name: "Reparação de Ar Condicionado",
            },
            {
              id: "19006",
              name: "Aplicação de Fumos",
            },
          ],
        },
      ],
    },
    {
      value: "Eventos e Decorações",
      priority: 3,
      subcategories: [
        {
          id: "141",
          name: "Fotografia",
          subSubCategories: [
            {
              id: "1411",
              name: "Fotógrafo",
            },
          ],
        },
        {
          id: "142",
          name: "Vídeo e Áudio",
          subSubCategories: [
            {
              id: "1421",
              name: "Edição de Vídeo",
            },
          ],
        },
        {
          id: "143",
          name: "Catering",
          subSubCategories: [
            {
              id: "1431",
              name: "Categring de Dominílio",
            },
            {
              id: "1432",
              name: "Categring de Festas e Eventos",
            },
            {
              id: "1432",
              name: "Bolos e Doces",
            },
          ],
        },
      ],
    },
    {
      value: "Transportes e Movimentação",
      priority: 4,
      subcategories: [
        {
          id: "161",
          name: "Mudanças",
          subSubCategories: [
            {
              id: "1611",
              name: "Mudança (Menos de 50km)",
            },
            {
              id: "1612",
              name: "Mudança de Longa Distância",
            },
            {
              id: "1613",
              name: "Transporte de Móveis",
            },
            {
              id: "1614",
              name: "Mudança de Móveis e de Estrutura Pesadas",
            },
          ],
        },
        {
          id: "162",
          name: "Aluguer de Equipamentos",
          subSubCategories: [
            {
              id: "1621",
              name: "Aluguer de Carrinhas e Camiões",
            },
            {
              id: "1623",
              name: "Aluger de Equipamento Agrícola",
            },
            {
              id: "1624",
              name: "Serviço de Bobcat",
            },
            {
              id: "1625",
              name: "Serviço de Retroescavadora",
            },
            {
              id: "1626",
              name: "Cisterna de Água",
            },
            {
              id: "1627",
              name: "Transporte de Contentores",
            },
            {
              id: "1628",
              name: "Camião de Recolha de Resíduos",
            },
          ],
        },
      ],
    },
    {
      value: "Cursos e Classes",
      priority: 5,
      subcategories: [
        {
          id: "171",
          name: "Explicação",
          subSubCategories: [
            {
              id: "1711",
              name: "Preparação para entrada a Universidade",
            },
            {
              id: "1712",
              name: "Primeiro Ciclo, Segundo Ciclo e Ensino Médio",
            },
          ],
        },
        {
          id: "172",
          name: "Cursos",
          subSubCategories: [
            {
              id: "1721",
              name: "Línguas",
            },
          ],
        },
        {
          id: "173",
          name: "Ginástica",
          subSubCategories: [
            {
              id: "1731",
              name: "Treinador Pessoal",
            },
            {
              id: "1732",
              name: "Treinador Pessoal (Outdoor)",
            },
          ],
        },
      ],
    },
    {
      value: "Reformas e Construção",
      priority: 6,
      subcategories: [
        {
          id: "121",
          name: "Pavimentos",
          subSubCategories: [
            {
              id: "1211",
              name: "Aplicação de Pavimento em Madeira",
            },
            {
              id: "1212",
              name: "Reparação ou Substituição de Pavimento em Madeira",
            },
            {
              id: "1213",
              name: "Reparação ou Substituição de Pavimento em Ladrilho ou Pedra",
            },
          ],
        },
        {
          id: "151",
          name: "Carpintaria e Marcenaria",
          subSubCategories: [
            {
              id: "1511",
              name: "Fabrico de Armários de Cozinha",
            },
            {
              id: "1512",
              name: "Fabrico de Roupeiros",
            },
            {
              id: "1513",
              name: "Fabrico de Portas e Janelas",
            },
            {
              id: "1514",
              name: "Remodelação ou Reparação de Armários",
            },
            {
              id: "1515",
              name: "Restauro de Móveis",
            },
            {
              id: "1516",
              name: "Projectos de Marcenaria Fina",
            },
            {
              id: "1517",
              name: "Projectos de Carpintaria Geral",
            },
          ],
        },
        {
          id: "152",
          name: "Reformas",
          subSubCategories: [
            {
              id: "1521",
              name: "Reformas de Casa",
            },
            {
              id: "1522",
              name: "Remodelação de Casa de Banho",
            },
            {
              id: "1523",
              name: "Remodelação de Conzinhas",
            },
            {
              id: "1524",
              name: "Remodelação de Cozinhas",
            },
            {
              id: "1525",
              name: "Remodelação de Loja",
            },
            {
              id: "1526",
              name: "Remodelação de Quarto",
            },
            {
              id: "1527",
              name: "Remodelação de Varanda",
            },
          ],
        },
        {
          id: "153",
          name: "Construção Civil",
          subSubCategories: [
            {
              id: "1531",
              name: "Construção de Casa Modular",
            },
            {
              id: "1532",
              name: "Construção de Casa Nova",
            },
            {
              id: "1533",
              name: "Construção de Parede interior",
            },
            {
              id: "1534",
              name: "Aplicação de Azulejos ou Mosaicos",
            },
            {
              id: "1535",
              name: "Construção de Teto Falso",
            },
            {
              id: "1536",
              name: "Demolição de Construção",
            },
            {
              id: "1537",
              name: "Obras de Remodelação",
            },
            {
              id: "1538",
              name: "Construção de Tanque de Água",
            },
            {
              id: "1539",
              name: "Construção de Piscina",
            },
            {
              id: "15311",
              name: "Construção de Fossa Séptica",
            },
          ],
        },
        {
          id: "154",
          name: "Paredes, Pladur e Escadas",
          subSubCategories: [
            {
              id: "1541",
              name: "Aplicação de estuque",
            },
            {
              id: "1542",
              name: "Construção de Escadas e Escadeirias",
            },
            {
              id: "1543",
              name: "Insonorização",
            },
            {
              id: "1544",
              name: "Instalação de Escadas",
            },
            {
              id: "1545",
              name: "Construção de Paredes de Pladur",
            },
            {
              id: "1546",
              name: "Instalação, Reparação ou Reparação de Revestimento de Parede",
            },
            {
              id: "1547",
              name: "Reboco",
            },
            {
              id: "1548",
              name: "Recuperação de Escadas e Escadarias",
            },
            {
              id: "1549",
              name: "Reparação e Texturização de Paredes de Pladur",
            },
            {
              id: "15491",
              name: "Revestimento de Parede em Madeira",
            },
            {
              id: "15492",
              name: "Aplicação de Papel de Parede",
            },
            {
              id: "15493",
              name: "Projectos de Decoração em 3D",
            },
          ],
        },
        {
          id: "155",
          name: "Decoração de Imóvel",
          subSubCategories: [
            {
              id: "1551",
              name: "Decoração em Interiores",
            },
            {
              id: "1552",
              name: "Decoração de Exteriores",
            },
            {
              id: "1553",
              name: "Aplicação de estuque",
            },
            {
              id: "1554",
              name: "Instalação ou Substituição de Cortinas",
            },
            {
              id: "1555",
              name: "Reparação de Cortinas",
            },
            {
              id: "1556",
              name: "Suspensão de Quadros ou Obras de Arte",
            },
          ],
        },
      ],
    },
  ];

  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = await prisma.category.create({
      data: {
        title: CATEGORIES[i].value,
        url: "",
        priority: CATEGORIES[i].priority,
      },
    });

    for (let x = 0; x < CATEGORIES[i].subcategories.length; x++) {
      const subcategory = await prisma.subCategory.create({
        data: {
          title: CATEGORIES[i].subcategories[x].name,
          url: "",
          categoryId: category.id,
        },
      });

      const subsubcategory = await prisma.subSubCategory.create({
        data: {
          title: CATEGORIES[i].subcategories[x].name,
          url: "",
          subCategoryId: subcategory.id,
        },
      });

      for (
        let y = 0;
        y < CATEGORIES[i].subcategories[x].subSubCategories.length;
        y++
      ) {
        await prisma.services.create({
          data: {
            title: CATEGORIES[i].subcategories[x].subSubCategories[y].name,
            subSubCategoryId: subsubcategory.id,
          },
        });
      }
    }
  }
}

async function buildQuestion() {
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  const questions = [
    {
      type: "SIMPLE",
      title: "Qual é o tamanho aproximado da área a ser limpa e/ou tratada?",
      options: [],
    },
    {
      type: "SINGLE_SELECT",
      title: "Qual é o tipo principal de serviço que você deseja agendar?",
      options: ["Limpeza Profunda", "Desinfestação", "Jardinagem"],
    },
    {
      type: "MULTIPLE_SELECT",
      title:
        "Quais áreas específicas você gostaria que fossem alvo da limpeza profunda?",
      options: ["Cozinha", "Banheiros", "Sala de estar", "Quartos"],
    },
    {
      type: "BOOLEAN",
      title: "Você possui animais de estimação na propriedade?",
      options: ["SIM", "NÃO"],
    },
  ];

  const services = await prisma.services.findMany();

  for (let i = 0; i < services.length; i++) {
    for (let x = 0; x < questions.length; x++) {
      const question = await prisma.question.create({
        data: {
          title: questions[x].title,
          serviceId: services[i].id,
          type: questions[x].type as QuestionType,
        },
      });

      for (let y = 0; y < questions[x].options.length; y++) {
        await prisma.option.create({
          data: {
            value: questions[x].options[y],
            questionId: question.id,
          },
        });
      }
    }
  }
}

async function buildAdition() {
  for (const element of listJobCancelReason) {
    await prisma.jobCancelReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of quotationRejectReason) {
    await prisma.quotationRejectReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of taskDeleteReason) {
    await prisma.taskDeleteReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of subscriptionsPlan) {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        creditsPerJob: element.creditsPerJob,
        description: element.description,
        duration: element.duration,
        name: element.name,
        price: element.price,
        rollOverCredit: element.rollOverCredit,
        status: element.status as SubscriptionPlanStatus,
        benefits: element.benefits,
        discountValue: element.discountValue,
        isDefault: element.isDefault,
      },
    });

    for (let y = 0; y < element.discountsCommission.length; y++) {
      await prisma.discountCommission.create({
        data: {
          commission: element.discountsCommission[y].commission,
          maxValue: element.discountsCommission[y].maxValue,
          minValue: element.discountsCommission[y].minValue,
          status: "ACTIVE",
          planId: plan.id,
        },
      });
    }

    for (const element of creditsPackage) {
      await prisma.creditPackage.create({
        data: {
          amount: element.amount,
          name: element.name,
          status: element.status,
          totalCredit: element.totalCredit,
          vat: element.vat,
        },
      });
    }
  }
}

async function setup() {
  for (const element of categories) {
    const selectedCategory = element;
    const categoryCreated = await prisma.category.create({
      data: {
        title: selectedCategory.title,
        priority: selectedCategory.priority,
        url: "",
      },
    });

    const listSubcategories = selectedCategory.subcategories;
    for (const sub of listSubcategories) {
      const selectedSubcategory = sub;

      const subCategoryCreated = await prisma.subCategory.create({
        data: {
          title: selectedSubcategory.title,
          url: "",
          categoryId: categoryCreated.id,
          hasSubSubCategory: selectedSubcategory.hasSubcategory,
        },
      });

      if (selectedSubcategory.hasSubcategory) {
        const subSubcategories = [];
        console.log(subSubcategories);
      } else {
        const baseSubSubcategory = await prisma.subSubCategory.create({
          data: {
            title: subCategoryCreated.title,
            url: "",
            subCategoryId: subCategoryCreated.id,
          },
        });

        for (const element of selectedSubcategory.services) {
          const selectedService = element;

          const service = await prisma.services.create({
            data: {
              title: selectedService.title,
              subSubCategoryId: baseSubSubcategory.id,
            },
          });

          if (selectedService.questions) {
            const questions = selectedService.questions;
            for (const que1 of questions) {
              const que = await prisma.question.create({
                data: {
                  title: que1.title,
                  serviceId: service.id,
                  type: que1.type as QuestionType,
                },
              });

              const options = que1.options;

              for (const opt of options) {
                await prisma.option.create({
                  data: {
                    value: opt,
                    questionId: que.id,
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  for (const element of listReasonForJobDispute) {
    await prisma.fileDisputeReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of listJobCancelReason) {
    await prisma.jobCancelReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of quotationRejectReason) {
    await prisma.quotationRejectReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of taskDeleteReason) {
    await prisma.taskDeleteReason.create({
      data: {
        value: element,
      },
    });
  }

  for (const element of subscriptionsPlan) {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        creditsPerJob: element.creditsPerJob,
        description: element.description,
        duration: element.duration,
        name: element.name,
        price: element.price,
        rollOverCredit: element.rollOverCredit,
        status: element.status as SubscriptionPlanStatus,
        benefits: element.benefits,
        discountValue: element.discountValue,
        isDefault: element.isDefault,
      },
    });

    for (let y = 0; y < element.discountsCommission.length; y++) {
      await prisma.discountCommission.create({
        data: {
          commission: element.discountsCommission[y].commission,
          maxValue: element.discountsCommission[y].maxValue,
          minValue: element.discountsCommission[y].minValue,
          status: "ACTIVE",
          planId: plan.id,
        },
      });
    }

    for (const element of creditsPackage) {
      await prisma.creditPackage.create({
        data: {
          amount: element.amount,
          name: element.name,
          status: element.status,
          totalCredit: element.totalCredit,
          vat: element.vat,
        },
      });
    }
  }
}

//#endregion

async function main() {
  // Seed Users
  const superAdmin1 = await prisma.user.create({
    data: {
      email: "superadmin1@bulir.com",
      password: await bcryptHasher.hash("password"),
      accountType: "SuperAdmin",
      state: "Active",
    },
  });

  await setup();
  await newPlan();
  await buildCategories();
  await buildQuestion();
  await buildAdition();

  console.debug("Created superAdmin1:", superAdmin1.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
