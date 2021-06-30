import {
  manageFunctionMetadata,
  FunctionMetadata,
} from '@onhand/openapi/#/functionMetadata'
import { as } from '@onhand/utils'

export type Policy =
  | {
    managedPolicy: string
  }
  | {
    inlinePolicy: {
      actions: string[]
      effect: 'Allow' | 'Deny'
      resources: string[]
    }
  }

export type PoliciesMetadata = { policies: Policy[] }

export function addPolicy (FunctionClass: any, ...policies: Policy[]) {
  manageFunctionMetadata<FunctionMetadata & PoliciesMetadata>(
    FunctionClass,
  ).change(metadata => {
    if (!metadata) {
      metadata = as<FunctionMetadata & PoliciesMetadata>({})
    }
    if (!metadata.policies) {
      metadata.policies = []
    }
    for (const policy of policies) {
      metadata.policies.push(policy)
    }
    return metadata
  })
}

export function fromAwsManagedPolicyName (policyName: string): Policy {
  return {
    managedPolicy: policyName,
  }
}

export function fromInlinePolicy (
  actions: string[],
  resources: string[] = ['*'],
  effect: 'Allow' | 'Deny' = 'Allow',
): Policy {
  return {
    inlinePolicy: {
      actions,
      effect,
      resources,
    },
  }
}
