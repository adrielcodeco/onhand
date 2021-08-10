import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { FormSteps } from '~/components/organisms/project/formSteps'

export function ProjectAdd () {
  return (
    <div>
      <Typography gutterBottom variant='h5' component='h1'>
        Projects
      </Typography>
      <Typography gutterBottom variant='subtitle1' component='h2'>
        Follow this steps to add a project
      </Typography>
      <Paper>
        <FormSteps />
      </Paper>
    </div>
  )
}
