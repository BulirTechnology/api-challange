import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { GenderProps, UserState } from "./user";

export type EducationLevel =
  "PrimaryEducation" |
  "SecondaryEducation" | 
  "HigherEducation" | 
  "GraduateEducation" |
  "ProfessionalDegrees"

export interface ServiceProviderProps {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  bornAt: Date
  gender: GenderProps
  address?: []
  description: string
  education: EducationLevel
  isApproved?: boolean
  isEmailValidated?: boolean
  isPhoneNumberValidated?: boolean
  state: UserState
  profileUrl: string | null
  rating: number
  hasBudget: boolean
  isFavorite: boolean
  hasCertificateByBulir: boolean
  userId: UniqueEntityID
  createdAt?: Date | null
  updatedAt?: Date | null
}

export class ServiceProvider extends Entity<ServiceProviderProps> {
  get firstName() {
    return this.props.firstName;
  }
  get isFavorite() {
    return this.props.isFavorite;
  }
  get isApproved() {
    return this.props.isApproved;
  }
  get description() {
    return this.props.description;
  }
  get state() {
    return this.props.state;
  }
  get education() {
    return this.props.education;
  }
  get lastName() {
    return this.props.lastName;
  }
  get isEmailValidated() {
    return this.props.isEmailValidated;
  }
  get isPhoneNumberValidated() {
    return this.props.isPhoneNumberValidated;
  }
  get email() {
    return this.props.email;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get gender() {
    return this.props.gender;
  }
  get bornAt(){
    return this.props.bornAt;
  }
  get userId(){
    return this.props.userId;
  }
  get profileUrl(){
    return this.props.profileUrl;
  }
  get rating(){
    return this.props.rating;
  }
  get hasBudget(){
    return this.props.hasBudget;
  }
  get hasCertificateByBulir(){
    return this.props.hasCertificateByBulir;
  }
  get createdAt(){
    return this.props.createdAt;
  }
  get updatedAt(){
    return this.props.updatedAt;
  }

  static create(props: ServiceProviderProps, id?: UniqueEntityID) {
    const serviceProvider = new ServiceProvider(props, id);

    return serviceProvider;
  }
}
