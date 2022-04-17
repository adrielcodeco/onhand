import { manageFunctionMetadata, FunctionMetadata } from '@onhand/openapi'
import { As } from '@onhand/utils'

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
  manageFunctionMetadata<FunctionMetadata<PoliciesMetadata>>(
    FunctionClass,
  ).change(metadata => {
    if (!metadata) {
      metadata = As<FunctionMetadata<PoliciesMetadata>, any>({ extra: {} })
    }
    if (!metadata.extra) {
      metadata.extra = { policies: [] }
    }
    if (!metadata.extra.policies) {
      metadata.extra.policies = []
    }
    for (const policy of policies) {
      metadata.extra.policies.push(policy)
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
