import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface SkillProps {
  name: string
}

export class Skill extends Entity<SkillProps> {
  get name() {
    return this.props.name;
  }

  static create(props: SkillProps, id?: UniqueEntityID) {
    const skill = new Skill({
      ...props,
    }, id);

    return skill;
  }
}
