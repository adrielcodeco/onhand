type Resource = {
  name: string
  [key: string]: string
}

type Resources = {
  [resource: string]: Resource
}

export const resources: Resources = {
  categories: {
    name: 'categories',
    list: '/categories',
    find: '/categories/{categoryId}',
    add: '/categories',
    alter: '/categories/{categoryId}',
    delete: '/categories/{categoryId}',
  },
  dashboards: {
    name: 'dashboards',
    monthlyEntry: '/dashboards/monthly-entry',
    monthlyInOut: '/dashboards/monthly-io',
    yearlyEntryMbMAndMonthlyOut: '/dashboards/yearly-entry-m-b-m-and-monthly-out',
    yearlyInOutMbM: '/dashboards/yearly-in-out-m-b-m',
    yearlyResultMbM: '/dashboards/yearly-result-m-b-m',
  },
  entries: {
    name: 'entries',
    list: '/entries',
    find: '/entries/{entryId}',
    add: '/entries',
    alter: '/entries/{entryId}',
    delete: '/entries/{entryId}',
  },
  environments: {
    name: 'environments',
    version: '/environments/version',
  },
  paymentTypes: {
    name: 'paymentTypes',
    list: '/payment-types',
    find: '/payment-types/{paymentTypeId}',
    add: '/payment-types',
    alter: '/payment-types/{paymentTypeId}',
    delete: '/payment-types/{paymentTypeId}',
  },
  users: {
    name: 'users',
    find: '/users/{userId}',
    add: '/users',
    alter: '/users/{userId}',
    delete: '/users/{userId}',
  },
}
