import React from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import { stateService } from '~/services/state'
import { ProjectPathStep } from '~/components/molecules/projects/steps/projectPathStep'
import { ProjectDetailsStep } from '~/components/molecules/projects/steps/projectDetailsStep'
import { GitAccessStep } from '~/components/molecules/projects/steps/gitAccessStep'
import { GitRepoStep } from '~/components/molecules/projects/steps/gitRepoStep'
import { CreateProjectStep } from '~/components/molecules/projects/steps/createProjectStep'
import { NavigationStep } from '~/components/molecules/projects/steps/navigationStep'

const useStyles = makeStyles(theme => ({
  stepper: {
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
  },
}))

export const FormSteps = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = React.useState(0)
  React.useEffect(() => {
    const state = stateService.getState()
    if (state) {
      if (state.activeStep || state.activeStep === 0) {
        setActiveStep(state.activeStep)
      }
    }
  }, [])
  const handleNext = () => {
    stateService.setState('activeStep', activeStep + 1)
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }
  const handleBack = () => {
    stateService.setState('activeStep', activeStep - 1)
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const cancel = () => {
    stateService.replaceState({})
    navigate('/projects', { replace: true })
  }
  return (
    <Stepper
      activeStep={activeStep}
      orientation='vertical'
      className={classes.stepper}
    >
      <ProjectPathStep cancel={cancel} handleNext={handleNext} />
      <ProjectDetailsStep
        cancel={cancel}
        handleBack={handleBack}
        handleNext={handleNext}
      />
      <GitAccessStep
        currentStep={activeStep}
        cancel={cancel}
        handleBack={handleBack}
        handleNext={handleNext}
        changeStep={setActiveStep}
      />
      <GitRepoStep
        cancel={cancel}
        handleBack={handleBack}
        handleNext={handleNext}
      />
      <CreateProjectStep
        cancel={cancel}
        handleBack={handleBack}
        handleNext={handleNext}
      />
      <NavigationStep projectId='' />
    </Stepper>
  )
}
