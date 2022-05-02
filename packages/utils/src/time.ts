import ms from 'ms'

const sec = (v: string) => ms(v) / 1000
const min = (v: string) => ms(v) / 1000 / 60
const hr = (v: string) => ms(v) / 1000 / 60 / 60
const day = (v: string) => ms(v) / 1000 / 60 / 60 / 24

export { ms, min, sec, hr, day }
