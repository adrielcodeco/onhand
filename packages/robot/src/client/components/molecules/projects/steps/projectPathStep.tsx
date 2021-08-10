import React from 'react'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@material-ui/core/styles'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import { stateService } from '~/services/state'
import { projectService } from '~/services/projects'

const useStyles = makeStyles(theme => ({
  input: {},
  actionsContainer: {},
  button: {},
  backdrop: {},
}))

const emptyFieldMsg = 'This field is required'
const directoryAlreadyAdded = 'This directory has already been added'

interface ProjectPathStepProps {
  cancel: React.MouseEventHandler<HTMLButtonElement>
  handleNext: () => void
}

export const ProjectPathStep = (props: ProjectPathStepProps) => {
  const { cancel, handleNext } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [projectPath, setProjectPath] = React.useState('')
  const [projectPathValidation, setProjectPathValidation] = React.useState('')
  const [waiting, setWaiting] = React.useState(false)
  React.useEffect(() => {
    const state = stateService.getState()
    if (state) {
      if (state.projectPath) {
        setProjectPath(state.projectPath)
      }
    }
  }, [])
  const directoryPathChanged = (event: any) => {
    if (!event.target.value) {
      if (projectPathValidation !== emptyFieldMsg) {
        setProjectPathValidation(emptyFieldMsg)
      }
    } else {
      if (
        projectPathValidation === emptyFieldMsg ||
        projectPathValidation === directoryAlreadyAdded
      ) {
        setProjectPathValidation('')
      }
    }
    stateService.setState('projectPath', event.target.value)
    setProjectPath(event.target.value)
  }
  const checkDirectoryPath = async () => {
    setWaiting(true)
    if (!projectPath) {
      setProjectPathValidation(emptyFieldMsg)
      enqueueSnackbar('check validations')
      setWaiting(false)
      return
    }
    try {
      const project = await projectService.pathAlreadyExists(projectPath)
      if (project) {
        setProjectPathValidation(directoryAlreadyAdded)
        enqueueSnackbar('check validations')
        setWaiting(false)
        return
      }
      handleNext()
      setWaiting(false)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <Step>
      <StepLabel>Project path</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography>Project parent directory:</Typography>
        <TextField
          label='directory path'
          variant='filled'
          className={classes.input}
          value={projectPath}
          onChange={directoryPathChanged}
          error={!!projectPathValidation}
          helperText={projectPathValidation}
        />
        <div className={classes.actionsContainer}>
          <div>
            <Button
              variant='contained'
              color='primary'
              onClick={checkDirectoryPath}
              className={classes.button}
            >
              Next
            </Button>
            <Button onClick={cancel} className={classes.button}>
              Cancel
            </Button>
          </div>
        </div>
        <Backdrop className={classes.backdrop} open={waiting}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </StepContent>
    </Step>
  )
}
