import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export type LuandaCity =
  "Outro" |
  "IcoloBengo" |
  "Luanda" |
  "Quicama" |
  "Cacuaco" |
  "Cazenga" |
  "Viana" |
  "Belas" |
  "KilambaKiaxi" |
  "Talatona"

export type AgeGroup =
  "from16To24" |
  "from25To34" |
  "from35To44" |
  "from45To54" |
  "from55To64" |
  "from65OrMore"


export type SpendOnServices =
  "from3000To9000" |
  "from10000To19000" |
  "from20000To39000" |
  "from40000OrMore"


export type WayFindServiceProvider =
  "fromFriendsOrTrustedPeople" |
  "fromFamilyRecommendation" |
  "fromAnyoneRecommendation" |
  "fromInternetSearch" |
  "other"

export const AgeGroupMap = {
  "from16To24": '16 - 34 anos',
  "from25To34": '25 - 34 anos',
  "from35To44": '35 - 44 anos',
  "from45To54": '45 - 54 anos',
  "from55To64": '55 - 64 anos',
  "from65OrMore": 'mais de 50 anos'
}

export const SpendOnServicesMap = {
  "from3000To9000": '3.000 - 9.000 Kz',
  "from10000To19000": '10.000 - 19.000 Kz',
  "from20000To39000": '20.000 - 39.000 Kz',
  "from40000OrMore": 'mais de 40.000 Kz'
}

export const WayFindServicesProviderMap = {
  "fromFriendsOrTrustedPeople": "Amigos ou pessoas de confiança",
  "fromFamilyRecommendation": "Recomendação de familiares",
  "fromAnyoneRecommendation": "Recomendação de qualquer pessoa",
  "fromInternetSearch": "Busca na internet",
  "other": "Outro"
}

export interface ClientInquireProps {
  emailOrNumber: string
  city: LuandaCity
  whereLeave: string
  ageGroup: AgeGroup
  preferredServices: string[]
  spendOnServices: SpendOnServices
  wayFindServiceProvider: WayFindServiceProvider
  createdAt: Date
  updatedAt?: Date | null
}

export class ClientInquire extends Entity<ClientInquireProps> {
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
  get spendOnServices() {
    return this.props.spendOnServices;
  }
  get wayFindServiceProvider() {
    return this.props.wayFindServiceProvider;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: ClientInquireProps, id?: UniqueEntityID) {
    const client = new ClientInquire(props, id);

    return client;
  }
}
