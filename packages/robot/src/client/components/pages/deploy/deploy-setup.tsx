import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Envs } from '~/components/organisms/deploy/envs'

const useStyles = makeStyles({
  titleDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

export function DeploySetup () {
  const classes = useStyles()
  return (
    <div>
      <div className={classes.titleDiv}>
        <h1>Deploy Setup</h1>
      </div>
      <Envs />
    </div>
  )
}
