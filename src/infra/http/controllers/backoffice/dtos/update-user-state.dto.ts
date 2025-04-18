import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserState } from "@prisma/client";

export class UpdateUserStateDto {
  @ApiProperty({
    enum: [UserState],
    example: UserState.Active,
  })
  @IsEnum(UserState)
  state!: UserState;
}
