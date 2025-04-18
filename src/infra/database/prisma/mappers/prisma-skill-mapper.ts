import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Skill } from "@/domain/users/enterprise/skill";
import { Skill as PrismaSkills } from "@prisma/client";

export class PrismaSkillMapper {
  static toDomain(info: PrismaSkills): Skill {
    return Skill.create({
      name: info.name,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(address: Skill): PrismaSkills {
    return {
      id: address.id.toString(),
      name: address.name,
    };
  }
}