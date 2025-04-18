import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface PrivateTaskProps {
  taskId: string
  serviceProviderId: string
}

export class PrivateTask extends Entity<PrivateTaskProps> {
  get taskId() {
    return this.props.taskId;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }

  static create(props: PrivateTaskProps, id?: UniqueEntityID) {
    const privateTask = new PrivateTask({
      ...props,
    }, id);

    return privateTask;
  }
}
