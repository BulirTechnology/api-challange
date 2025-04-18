import { SpecializationsRepository } from "@/domain/users/application/repositories/specialization-repository";
import { Specialization } from "@/domain/users/enterprise/specialization";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaSpecializationMapper } from "../mappers/prisma-specialization-mapper";

import {
  Pagination,
  PaginationParams
} from "@/core/repositories/pagination-params";

import {
  Prisma,
  Specialization as PrismaSpecialization,
  Services,
  SubSubCategory,
  SubCategory,
  Category
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

type SpecializationType = PrismaSpecialization & {
  service: Services & {
    category: SubSubCategory & {
      category: SubCategory & {
        category: Category & {
          subcategories: SubSubCategory
        }
      }
    }
  }
}

@Injectable()
export class PrismaSpecializationsRepository implements SpecializationsRepository {
  constructor(private prisma: PrismaService) { }

  async deleteManyOfSp(params: { serviceProviderId: string; }): Promise<void> {
    await this.prisma.specialization.deleteMany({
      where: {
        serviceProviderId: params.serviceProviderId
      }
    })
  }

  async findByServiceIdAndServiceProviderId(params: { serviceId: string; serviceProviderId: string; }): Promise<Specialization | null> {
    const specialization = await this.prisma.specialization.findFirst({
      where: {
        serviceProviderId: params.serviceProviderId,
        serviceId: params.serviceId
      },
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!specialization) return null;

    return PrismaSpecializationMapper.toDomain({
      createdAt: specialization.createdAt,
      id: specialization.id,
      price: specialization.price,
      rate: specialization.rate,
      serviceId: specialization.serviceId,
      serviceProviderId: specialization.serviceProviderId,
      title: specialization.title,
      updatedAt: specialization.updatedAt,
      service: {
        title: specialization.service?.title + "",
        category: {
          id: specialization.service?.category.id + "",
          title: specialization.service?.category.title + "",
          category: {
            id: specialization.service?.category.category.id + "",
            title: specialization.service?.category.category.title + "",
            category: {
              id: specialization.service?.category.category.category.id + "",
              title: specialization.service?.category.category.category.title + "",
              url: specialization.service?.category.category.category.url + ""
            }
          }
        }
      }
    });
  }

  async findByServiceProviderId(serviceProviderId: string): Promise<Specialization | null> {
    const specialization = await this.prisma.specialization.findFirst({
      where: {
        serviceProviderId: serviceProviderId
      },
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!specialization) return null;

    return PrismaSpecializationMapper.toDomain({
      createdAt: specialization.createdAt,
      id: specialization.id,
      price: specialization.price,
      rate: specialization.rate,
      serviceId: specialization.serviceId,
      serviceProviderId: specialization.serviceProviderId,
      title: specialization.title,
      updatedAt: specialization.updatedAt,
      service: {
        title: specialization.service?.title + "",
        category: {
          id: specialization.service?.category.id + "",
          title: specialization.service?.category.title + "",
          category: {
            id: specialization.service?.category.category.id + "",
            title: specialization.service?.category.category.title + "",
            category: {
              id: specialization.service?.category.category.category.id + "",
              title: specialization.service?.category.category.category.title + "",
              url: specialization.service?.category.category.category.url + ""
            }
          }
        }
      }
    });
  }
  async findMany(params: PaginationParams & { serviceProviderId: string }): Promise<Pagination<Specialization>> {
    const page = params.page;

    const data = await this.paginate({
      orderBy: {
        createdAt: "desc",
      },
      page,
      perPage: params.perPage,
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      where: params.serviceProviderId ? {
        serviceProviderId: params.serviceProviderId
      } : {}
    });

    return {
      data: data.data.map(specialization => {
        return PrismaSpecializationMapper.toDomain({
          createdAt: specialization.createdAt,
          id: specialization.id,
          price: specialization.price,
          rate: specialization.rate,
          serviceId: specialization.serviceId,
          serviceProviderId: specialization.serviceProviderId,
          title: specialization.title,
          updatedAt: specialization.updatedAt,
          service: {
            title: specialization.service?.title + "",
            category: {
              id: specialization.service?.category.id + "",
              title: specialization.service?.category.title + "",
              category: {
                id: specialization.service?.category.category.id + "",
                title: specialization.service?.category.category.title + "",
                category: {
                  id: specialization.service?.category.category.category.id + "",
                  title: specialization.service?.category.category.category.title + "",
                  url: specialization.service?.category.category.category.url + ""
                }
              }
            }
          }
        });
      }),
      meta: data.meta
    };
  }
  async deleteById(id: string): Promise<void> {
    await this.prisma.specialization.delete({
      where: {
        id
      }
    });
  }
  async findById(id: string): Promise<Specialization | null> {
    const specialization = await this.prisma.specialization.findUnique({
      where: {
        id
      },
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!specialization) return null;

    return PrismaSpecializationMapper.toDomain({
      createdAt: specialization.createdAt,
      id: specialization.id,
      price: specialization.price,
      rate: specialization.rate,
      serviceId: specialization.serviceId,
      serviceProviderId: specialization.serviceProviderId,
      title: specialization.title,
      updatedAt: specialization.updatedAt,
      service: {
        title: specialization.service?.title + "",
        category: {
          id: specialization.service?.category.id + "",
          title: specialization.service?.category.title + "",
          category: {
            id: specialization.service?.category.category.id + "",
            title: specialization.service?.category.category.title + "",
            category: {
              id: specialization.service?.category.category.category.id + "",
              title: specialization.service?.category.category.category.title + "",
              url: specialization.service?.category.category.category.url + ""
            }
          }
        }
      }
    });
  }
  async update(id: string, specialization: Specialization): Promise<Specialization> {
    const data = PrismaSpecializationMapper.toPrisma(specialization);

    const result = await this.prisma.specialization.update({
      data: {
        title: data.title,
        price: data.price,
        rate: data.rate,
        serviceId: data.serviceId,
        serviceProviderId: data.serviceProviderId,
      },
      where: {
        id
      },
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return PrismaSpecializationMapper.toDomain({
      createdAt: result.createdAt,
      id: result.id,
      price: result.price,
      rate: result.rate,
      serviceId: result.serviceId,
      serviceProviderId: result.serviceProviderId,
      title: result.title,
      updatedAt: result.updatedAt,
      service: {
        title: result.service?.title + "",
        category: {
          id: result.service?.category.id + "",
          title: result.service?.category.title + "",
          category: {
            id: result.service?.category.category.id + "",
            title: result.service?.category.category.title + "",
            category: {
              id: result.service?.category.category.category.id + "",
              title: result.service?.category.category.category.title + "",
              url: result.service?.category.category.category.url + ""
            }
          }
        }
      }
    });
  }
  async create(specialization: Specialization): Promise<Specialization> {
    const data = PrismaSpecializationMapper.toPrisma(specialization);

    const result = await this.prisma.specialization.create({
      data: {
        title: data.title,
        price: data.price,
        rate: data.rate,
        serviceId: data.serviceId,
        serviceProviderId: data.serviceProviderId
      },
      include: {
        service: {
          include: {
            category: {
              include: {
                category: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return PrismaSpecializationMapper.toDomain({
      createdAt: result.createdAt,
      id: result.id,
      price: result.price,
      rate: result.rate,
      serviceId: result.serviceId,
      serviceProviderId: result.serviceProviderId,
      title: result.title,
      updatedAt: result.updatedAt,
      service: {
        title: result.service?.title + "",
        category: {
          id: result.service?.category.id + "",
          title: result.service?.category.title + "",
          category: {
            id: result.service?.category.category.id + "",
            title: result.service?.category.category.title + "",
            category: {
              id: result.service?.category.category.category.id + "",
              title: result.service?.category.category.category.title + "",
              url: result.service?.category.category.category.url + ""
            }
          }
        }
      }
    });
  }
  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.SpecializationWhereInput,
    orderBy?: Prisma.SpecializationOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include?: Prisma.SpecializationInclude
  }): Promise<PaginatorTypes.PaginatedResult<SpecializationType>> {
    return paginate(
      this.prisma.specialization,
      {
        where,
        orderBy,
        include
      },
      {
        page,
        perPage,
      },
    );
  }
}