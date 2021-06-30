import { UserContext } from '#/dto/userContext'

export abstract class Ownership<I extends any> {
  abstract owner (input: I, userContext: UserContext): Promise<boolean>
}
