import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  AgeGroup,
  LuandaCity,
} from "./client-inquire";

export type WayToWork =
  "haveWorkAndFreelancerOnFreeTime" |
  "workAsFreelancer" |
  "haveWorkAndFreelancerOnVocation"

export const WayToWorkMap = {
  "haveWorkAndFreelancerOnFreeTime": "Trabalho noutra empresa, mas sou freelancer nos tempos livres",
  "workAsFreelancer": "Trabalho por conta própria (Freelancer)",
  "haveWorkAndFreelancerOnVocation": "Trabalho noutra empresa, mas sou freelancer nas férias"
}

export interface ServiceProviderInquireProps {
  emailOrNumber: string
  city: LuandaCity
  whereLeave: string
  ageGroup: AgeGroup
  preferredServices: string[]
  wayToWork: WayToWork
  createdAt: Date
  updatedAt?: Date | null
}

export class ServiceProviderInquire extends Entity<ServiceProviderInquireProps> {
  get emailOrNumber() {
    return this.props.emailOrNumber;
  }
  get city() {
    return this.props.city;
  }
  get whereLeave() {
    return this.props.whereLeave;
  }
  get ageGroup() {
    return this.props.ageGroup;
  }
  get preferredServices() {
    return this.props.preferredServices;
  }
  get wayToWork() {
    return this.props.wayToWork;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: ServiceProviderInquireProps, id?: UniqueEntityID) {
    const serviceprovider = new ServiceProviderInquire(props, id);

    return serviceprovider;
  }
}
