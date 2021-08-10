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

interface GitRepoStepProps {
  cancel: React.MouseEventHandler<HTMLButtonElement>
  handleBack: () => void
  handleNext: () => void
}

export const GitRepoStep = (props: GitRepoStepProps) => {
  const { cancel, handleBack, handleNext } = props
  const { projectName, noGit } = stateService.getState()
  const classes = useStyles()
  const [repoName, setRepoName] = React.useState('')
  const [repoNameValidation, setRepoNameValidation] = React.useState('')
  const repoNameChanged = (event: any) => {
    if (!event.target.value) {
      if (repoNameValidation !== emptyFieldMsg) {
        setRepoNameValidation(emptyFieldMsg)
      }
    } else {
      if (repoNameValidation === emptyFieldMsg) {
        setRepoNameValidation('')
      }
    }
    stateService.setState('repoName', event.target.value)
    setRepoName(event.target.value)
  }
  return (
    <Step disabled={noGit}>
      <StepLabel>Git Repo</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography>Create repo or use existing one</Typography>
        <div className={classes.form}>
          <TextField
            label='provider'
            variant='filled'
            className={classes.input}
            defaultValue='new_repo'
            select
          >
            <MenuItem value='new_repo'>Create new Repo</MenuItem>
            <MenuItem value='existing_repo'>Use existing Repo</MenuItem>
          </TextField>
          <TextField
            label='repo name'
            variant='filled'
            className={classes.input}
            defaultValue={projectName}
            value={repoName}
            onChange={repoNameChanged}
            error={!!repoNameValidation}
            helperText={repoNameValidation}
          />
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
