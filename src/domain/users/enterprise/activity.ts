import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ActivityProps {
  userId: UniqueEntityID
  activity: string
  createdAt: Date
}

export class Activity extends Entity<ActivityProps> {
  get activity() {
    return this.props.activity;
  }
  get userId(){
    return this.props.userId;
  }
  get createdAt(){
    return this.props.createdAt;
  }

  static create(props: Optional<ActivityProps, "createdAt">, id?: UniqueEntityID) {
    const activity = new Activity({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id);

    return activity;
  }
}
