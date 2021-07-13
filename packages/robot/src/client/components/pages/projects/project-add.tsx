import React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useSnackbar } from 'notistack'
import { ConfigContext } from '~/contexts/config'
import { projectService } from '~/services/projects'

const useStyles = makeStyles(theme => ({
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  input: {
    margin: theme.spacing(1),
    width: '30rem',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
}))

const emptyFieldMsg = 'This field is required'
const directoryAlreadyAdded = 'This directory has already been added'

export function ProjectAdd () {
  const classes = useStyles()
  const history = useHistory()
  const config = React.useContext<any>(ConfigContext)
  const { enqueueSnackbar } = useSnackbar()
  const [activeStep, setActiveStep] = React.useState(0)
  const [waiting, setWaiting] = React.useState(false)
  const [projectId, setProjectId] = React.useState('')
  const [projectPath, setProjectPath] = React.useState(config.cwd)
  const [projectPathValidation, setProjectPathValidation] = React.useState('')
  const [projectName, setProjectName] = React.useState('')
  const [projectNameValidation, setProjectNameValidation] = React.useState('')
  const [projectType, setProjectType] = React.useState('')
  const [projectTypeValidation, setProjectTypeValidation] = React.useState('')
  const handleNext = () => setActiveStep(prevActiveStep => prevActiveStep + 1)
  const handleBack = () => setActiveStep(prevActiveStep => prevActiveStep - 1)
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
    setProjectType(event.target.value)
  }
  const addProject = async () => {
    setWaiting(true)
    try {
      const project = await projectService.create({
        name: projectName,
        type: projectType,
        path: projectPath,
      })
      setProjectId(project.id)
      handleNext()
      setWaiting(false)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div>
      <Typography gutterBottom variant='h5' component='h1'>
        Projects
      </Typography>
      <Typography gutterBottom variant='subtitle1' component='h2'>
        Follow this steps to add a project
      </Typography>
      <Paper>
        <Stepper activeStep={activeStep} orientation='vertical'>
          <Step>
            <StepLabel>Project path</StepLabel>
            <StepContent>
              <Typography>Project working directory:</Typography>
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
                  <Button
                    onClick={() => history.replace('/projects')}
                    className={classes.button}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <Backdrop className={classes.backdrop} open={waiting}>
                <CircularProgress color='inherit' />
              </Backdrop>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Project details</StepLabel>
            <StepContent>
              <Typography>The working directory of your project:</Typography>
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
                    onClick={addProject}
                    className={classes.button}
                  >
                    ADD
                  </Button>
                  <Button
                    onClick={() => history.replace('/projects')}
                    className={classes.button}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Navegar</StepLabel>
            <StepContent>
              <Typography variant='h6'>Project added successfully</Typography>
              <Typography variant='body1'>
                Where would you like to go now?
              </Typography>
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
        </Stepper>
      </Paper>
    </div>
  )
}
