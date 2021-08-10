import React from 'react'
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

interface CreateProjectStepProps {
  cancel: React.MouseEventHandler<HTMLButtonElement>
  handleBack: () => void
  handleNext: () => void
}

export const CreateProjectStep = (props: CreateProjectStepProps) => {
  const { cancel, handleBack, handleNext } = props
  const classes = useStyles()
  const createProject = () => {
    handleNext()
    // setWaiting(true)
    // try {
    //   const project = await projectService.create({
    //     name: projectName,
    //     type: projectType,
    //     path: projectPath,
    //   })
    //   setProjectId(project.id)
    //   handleNext()
    //   setWaiting(false)
    // } catch (err) {
    //   console.error(err)
    // }
  }
  return (
    <Step>
      <StepLabel>Create project</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography variant='h6'>Project added successfully</Typography>
        <Typography variant='body1'>Where would you like to go now?</Typography>
        <div className={classes.actionsContainer}>
          <div>
            <Button onClick={handleBack} className={classes.button}>
              Back
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={createProject}
              className={classes.button}
            >
              Create project
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
