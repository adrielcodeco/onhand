import 'cross-fetch/polyfill'
import { inject } from 'inversify'
import axios from 'axios'
import jwkToPem from 'jwk-to-pem'
import jwt from 'jsonwebtoken'
import pify from 'pify'
import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
  CognitoUserAttribute,
  AuthenticationDetails,
  ISignUpResult,
} from 'amazon-cognito-identity-js'
import short from 'short-uuid'
import { service } from '@onhand/framework/#/ioc/decorators'
import { ICognitoService } from '@onhand/business-aws/#/services/iCognitoService'
import { Profile } from '@onhand/business-aws/#/dto/profile'
import {
  IOpaqueTokenRepository,
  IOpaqueTokenRepositoryToken,
} from '@onhand/business-aws/#/repositories'

export const userPoolIdSymbol = Symbol.for('userPoolId')
export const userPoolClientIdSymbol = Symbol.for('userPoolClientId')
export const userPoolRegionSymbol = Symbol.for('userPoolRegion')

@service()
export class CognitoService implements ICognitoService {
  private readonly userPool: CognitoUserPool

  constructor (
    @inject(userPoolIdSymbol)
    private readonly poolDataUserPoolId: string,
    @inject(userPoolClientIdSymbol)
    private readonly poolDataClientId: string,
    @inject(userPoolRegionSymbol)
    private readonly poolRegion: string,
    @inject(IOpaqueTokenRepositoryToken)
    private readonly opaqueTokenRepository: IOpaqueTokenRepository,
  ) {
    const userPoolData = {
      UserPoolId: this.poolDataUserPoolId,
      ClientId: this.poolDataClientId,
    }
    this.userPool = new CognitoUserPool(userPoolData)
  }

  async authenticate (
    user: string,
    pwd: string,
    scope: string,
  ): Promise<{ token: string, userIdentifier?: string }> {
    const authenticationDetails = new AuthenticationDetails({
      Username: user,
      Password: pwd,
    })
    const userData = {
      Username: user,
      Pool: this.userPool,
    }
    const cognitoUser = new CognitoUser(userData)
    const result: CognitoUserSession = await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: resolve,
        onFailure: reject,
      })
    })
    const getUserAttributes = pify(cognitoUser.getUserAttributes).bind(
      cognitoUser,
    )
    const attrs: CognitoUserAttribute[] = await getUserAttributes()
    const userIdentifier = attrs
      .find(a => a.getName() === 'custom:userIdentifier')
      ?.getValue()
    const role = attrs
      .find(a => a.getName() === 'custom:userGroupOrRole')
      ?.getValue()
    if (!userIdentifier) {
      throw new Error('invalid user')
    }
    if (!role) {
      throw new Error('invalid role')
    }
    const cognitoToken = result?.getAccessToken()?.getJwtToken()
    const opaqueToken = short.generate()
    await this.opaqueTokenRepository.add({
      cognitoToken,
      opaqueToken,
      userIdentifier,
      role,
      scope,
    })
    return { token: opaqueToken, userIdentifier }
  }

  async register (profile: Profile): Promise<Profile | undefined> {
    if (!profile.userIdentifier) {
      profile.userIdentifier = short.generate()
    }
    const attributeList = [
      new CognitoUserAttribute({ Name: 'nickname', Value: profile.login }),
      new CognitoUserAttribute({ Name: 'email', Value: profile.email }),
      new CognitoUserAttribute({
        Name: 'custom:userIdentifier',
        Value: profile.userIdentifier,
      }),
      new CognitoUserAttribute({
        Name: 'custom:userGroupOrRole',
        Value: profile.userGroupOrRole,
      }),
      new CognitoUserAttribute({ Name: 'name', Value: profile.name }),
    ]

    const signUp = pify(this.userPool.signUp).bind(this.userPool)

    const result: ISignUpResult = await signUp(
      profile.login,
      profile.pwd,
      attributeList,
      [],
    )

    return result.userConfirmed ? profile : undefined
  }

  async validateToken (
    token: string,
  ): Promise<{ userIdentifier: string, userRole: string } | undefined> {
    const opaqueTokenEntity = await this.opaqueTokenRepository.find(token)
    if (!opaqueTokenEntity) {
      return undefined
    }
    const { cognitoToken } = opaqueTokenEntity
    const url = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.poolDataUserPoolId}/.well-known/jwks.json`
    const result = await axios.get(url).catch(err => {
      console.error('CognitoService.validateToken:', err)
      return { status: 0, data: null }
    })

    if (result.status !== 200) {
      return undefined
    }

    const pems = {}
    const keys = result.data.keys
    for (const key of keys) {
      const keyId = key.kid
      const modulus = key.n
      const exponent = key.e
      const keyType = key.kty
      const jwk = { kty: keyType, n: modulus, e: exponent }
      const pem = jwkToPem(jwk)
      Reflect.set(pems, keyId, pem)
    }
    // validate the token
    const decodedJwt = jwt.decode(cognitoToken, { complete: true })
    if (!decodedJwt || typeof decodedJwt === 'string') {
      console.error('CognitoService.validateToken: Not a valid JWT token')
      return undefined
    }

    const kid = decodedJwt.header.kid
    const pem = Reflect.get(pems, kid!)
    if (!pem) {
      console.error('CognitoService.validateToken: Invalid token')
      return undefined
    }

    const jwtVerify = pify(jwt.verify)
    const payload = await jwtVerify(cognitoToken, pem).catch(err => {
      console.error('CognitoService.validateToken:', err)
      return null
    })

    if (!payload) {
      console.error('CognitoService.validateToken: Invalid token')
      return undefined
    }

    return {
      userIdentifier: payload.userIdentifier,
      userRole: payload.userRole,
    }
  }

  async verifyEmailCode (user: string, code: string): Promise<void> {
    const userData = {
      Username: user,
      Pool: this.userPool,
    }
    const cognitoUser = new CognitoUser(userData)
    const confirmRegistration = pify(cognitoUser.confirmRegistration).bind(
      cognitoUser,
    )
    const result = await confirmRegistration(code, false)
    console.log(result)
  }
}
