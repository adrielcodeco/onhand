import React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  input: {},
  actionsContainer: {},
  button: {},
  form: {},
}))

interface NavigationStepProps {
  projectId: string
}

export const NavigationStep = (props: NavigationStepProps) => {
  const { projectId } = props
  const classes = useStyles()
  const history = useHistory()
  return (
    <Step>
      <StepLabel>Navigate</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography variant='h6'>Project added successfully</Typography>
        <Typography variant='body1'>Where would you like to go now?</Typography>
        <div className={classes.actionsContainer}>
          <div>
            <Button
              variant='contained'
              color='primary'
              onClick={() => history.replace('/projects')}
              className={classes.button}
            >
              Back to project list
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => history.replace(`/projects/${projectId}`)}
              className={classes.button}
            >
              Go to added project details
            </Button>
          </div>
        </div>
      </StepContent>
    </Step>
  )
}
