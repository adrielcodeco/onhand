import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Env } from '~/dto/env'

const useStyles = makeStyles(theme => ({
  dialog: {},
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

interface PromoteFunctionProps {
  promote?: { env: string, operationId?: string, version?: string }
  envs: Env[]
  specs: any[]
  onClose: () => void
}

export const PromoteFunction = ({
  promote,
  envs,
  specs,
  onClose,
}: PromoteFunctionProps) => {
  const classes = useStyles()
  const currentEnv = envs.find(e => e.name === promote?.env)
  const [promoteTo, setPromoteTo] = React.useState<string>()
  const [blocked, setBlocked] = React.useState(false)
  const onPromote = () => {
    setBlocked(true)
    onClose()
  }
  return (
    <>
      <Dialog
        open={!!promote}
        aria-labelledby='dialog-title'
        className={classes.dialog}
        onClose={onClose}
      >
        <DialogTitle id='dialog-title'>Promote</DialogTitle>
        <DialogContent>
          {currentEnv?.canBePromotedTo?.length &&
          currentEnv?.canBePromotedTo?.length > 1
            ? (
              <FormControl>
                <InputLabel htmlFor='age-native-simple'>promote to</InputLabel>
                <Select
                  native
                  defaultValue={currentEnv?.canBePromotedTo[0]}
                  value={promoteTo}
                  onChange={e => setPromoteTo(e.target.value as string)}
                  inputProps={{
                    name: 'age',
                    id: 'age-native-simple',
                  }}
                >
                  {currentEnv?.canBePromotedTo.map(env => (
                    <option key={env} value={env}>
                      {env}
                    </option>
                  ))}
                </Select>
              </FormControl>
              )
            : null}
          {promote?.operationId
            ? (
              <DialogContentText>
                We will promote the function <b>{promote.operationId ?? ''}</b>{' '}
                version <b>{promote.version ?? ''}</b> from{' '}
                <b>{currentEnv?.name ?? ''}</b> to{' '}
                <b>{promoteTo ?? currentEnv?.canBePromotedTo[0]}</b>
              </DialogContentText>
              )
            : (
              <DialogContentText>
                We will promote <b>all</b> functions from{' '}
                <b>{currentEnv?.name ?? ''}</b> to{' '}
                <b>{promoteTo ?? currentEnv?.canBePromotedTo[0]}</b>
              </DialogContentText>
              )}
        </DialogContent>
        <DialogActions>
          <Button color='default' onClick={onClose}>
            Cancel
          </Button>
          <Button color='primary' onClick={onPromote}>
            Promote
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={blocked}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}
