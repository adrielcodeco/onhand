import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { stateService } from '~/services/state'

const useStyles = makeStyles(theme => ({
  input: {},
  actionsContainer: {},
  button: {},
  form: {},
}))

const emptyFieldMsg = 'This field is required'

interface ProjectDetailsStepProps {
  cancel: React.MouseEventHandler<HTMLButtonElement>
  handleBack: () => void
  handleNext: () => void
}

export const ProjectDetailsStep = (props: ProjectDetailsStepProps) => {
  const { cancel, handleBack, handleNext } = props
  const classes = useStyles()
  const [projectName, setProjectName] = React.useState('')
  const [projectNameValidation, setProjectNameValidation] = React.useState('')
  const [projectType, setProjectType] = React.useState('')
  const [projectTypeValidation, setProjectTypeValidation] = React.useState('')
  React.useEffect(() => {
    const state = stateService.getState()
    if (state) {
      if (state.projectName) {
        setProjectName(state.projectName)
      }
      if (state.projectType) {
        setProjectType(state.projectType)
      }
    }
  }, [])
  const projectNameChanged = (event: any) => {
    if (!event.target.value) {
      if (projectNameValidation !== emptyFieldMsg) {
        setProjectNameValidation(emptyFieldMsg)
      }
    } else {
      if (projectNameValidation === emptyFieldMsg) {
        setProjectNameValidation('')
      }
    }
    stateService.setState('projectName', event.target.value)
    setProjectName(event.target.value)
  }
  const projectTypeChanged = (event: any) => {
    if (!event.target.value) {
      if (projectTypeValidation !== emptyFieldMsg) {
        setProjectTypeValidation(emptyFieldMsg)
      }
    } else {
      if (projectTypeValidation === emptyFieldMsg) {
        setProjectTypeValidation('')
      }
    }
    stateService.setState('projectType', event.target.value)
    setProjectType(event.target.value)
  }
  return (
    <Step>
      <StepLabel>Project details</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography>The details of your project:</Typography>
        <div className={classes.form}>
          <TextField
            label='name'
            variant='filled'
            className={classes.input}
            value={projectName}
            onChange={projectNameChanged}
            error={!!projectNameValidation}
            helperText={projectNameValidation}
          />
          <TextField
            label='type'
            variant='filled'
            className={classes.input}
            value={projectType}
            onChange={projectTypeChanged}
            error={!!projectTypeValidation}
            helperText={projectTypeValidation}
            select
          >
            <MenuItem value='site'>Site</MenuItem>
            <MenuItem value='api'>API</MenuItem>
          </TextField>
        </div>
        <div className={classes.actionsContainer}>
          <div>
            <Button onClick={handleBack} className={classes.button}>
              Back
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleNext}
              className={classes.button}
            >
              Next
            </Button>
            <Button onClick={cancel} className={classes.button}>
              Cancel
            </Button>
          </div>
        </div>
      </StepContent>
    </Step>
  )
}
