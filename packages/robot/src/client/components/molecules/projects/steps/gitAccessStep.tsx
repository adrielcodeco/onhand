import React from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { stateService } from '~/services/state'
import { githubService } from '~/services/github'

const useStyles = makeStyles(theme => ({
  input: {},
  actionsContainer: {},
  button: {},
  form: {},
}))

interface GitAccessStepProps {
  currentStep: number
  cancel: React.MouseEventHandler<HTMLButtonElement>
  handleBack: () => void
  handleNext: () => void
  changeStep: (step: number) => void
}

export const GitAccessStep = (props: GitAccessStepProps) => {
  const { currentStep, cancel, handleBack, handleNext, changeStep } = props
  const { noGit } = stateService.getState()
  const classes = useStyles()
  const [githubDeviceCode, setGithubDeviceCode] = React.useState('')
  const [githubUserCode, setGithubUserCode] = React.useState('')
  const [githubVerificationUri, setGithubVerificationUri] = React.useState('')
  const [githubExpiresIn, setGithubExpiresIn] = React.useState('')
  React.useEffect(() => {
    if (currentStep === 2 && !moment(githubExpiresIn).isAfter()) {
      githubService
        .getDeviceCode()
        .then(data => {
          const { deviceCode, userCode, verificationUri, expiresIn } = data
          setGithubDeviceCode(deviceCode)
          setGithubUserCode(userCode)
          setGithubVerificationUri(verificationUri)
          setGithubExpiresIn(expiresIn)
          window.open(verificationUri, '_blank')
        })
        .catch(console.error)
    }
  }, [currentStep])
  const skipGit = () => {
    stateService.setState('noGit', true)
    changeStep(4)
  }
  const gitSignin = async () => {
    const accessToken = await githubService
      .getAccessCode(githubDeviceCode)
      .catch(console.error)
    if (accessToken) {
      stateService.setState('githubAccessToken', accessToken)
      handleNext()
    }
  }
  return (
    <Step disabled={noGit}>
      <StepLabel>Git access</StepLabel>
      <StepContent {...{ orientation: 'vertical' }}>
        <Typography>Git signin:</Typography>
        <div className={classes.form}>
          <TextField
            label='provider'
            variant='filled'
            className={classes.input}
            defaultValue='github'
            select
          >
            <MenuItem value='github'>Github</MenuItem>
          </TextField>
          <Typography variant='body1'>
            Give me access on your github account and I will configure a repo
            for this project.
          </Typography>
          <Typography variant='body1'>
            1) Click <a href={githubVerificationUri}>this link</a> to redirect
            to github if the new tab does not open automatically
          </Typography>
          <Typography variant='body1'>
            2) Enter this code: <mark>{githubUserCode}</mark> on the github page
          </Typography>
          <Typography variant='body1'>
            3) Click the continue button on the github page
          </Typography>
          <Typography variant='body1'>
            4) Click the Check Access button below to check authentication
          </Typography>
        </div>
        <div className={classes.actionsContainer}>
          <div>
            <Button onClick={handleBack} className={classes.button}>
              Back
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={gitSignin}
              className={classes.button}
            >
              Check Access
            </Button>
            <Button onClick={skipGit} className={classes.button}>
              Skip git configuration
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
