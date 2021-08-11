import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Chip from '@material-ui/core/Chip'
import Select from '@material-ui/core/Select'
import { envsService } from '~/services/envs'
import { profilesService } from '~/services/profiles'

const useStyles = makeStyles(theme => ({
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '100%',
    maxWidth: '22rem',
    '& > *': {
      padding: '0 1rem 1rem 1rem',
      width: '100%',
      '& > *': {
        width: '100%',
      },
    },
  },
  title: {
    paddingTop: '1rem',
    textAlign: 'center',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}))

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export const Envs = () => {
  const classes = useStyles()
  const { projectId } = useParams<{ projectId: string }>()
  const [envs, setEnvs] = React.useState<any[]>([])
  const [profiles, setProfiles] = React.useState<any[]>([])
  React.useEffect(() => {
    envsService.list(projectId).then(setEnvs).catch(console.error)
    profilesService.list().then(setProfiles).catch(console.error)
  }, [])
  return (
    <div className={classes.cards}>
      {envs.map(({ env, profileName, canBePromotedTo }) => (
        <Paper key={env} className={classes.card}>
          <Typography variant='h4' className={classes.title}>
            {env.toUpperCase()}
          </Typography>
          <div>
            <TextField select label='Profile' value={profileName}>
              {profiles.map(({ profileName: profile }) => (
                <MenuItem key={profile} value={profile}>
                  {profile}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div>
            <FormControl>
              <InputLabel id={`dependency-label-${env}`}>
                Can be promoted to
              </InputLabel>
              <Select
                labelId={`dependency-label-${env}`}
                multiple
                value={canBePromotedTo}
                input={<Input />}
                renderValue={selected => (
                  <div className={classes.chips}>
                    {(selected as string[]).map(envName => (
                      <Chip
                        key={envName}
                        label={envName}
                        className={classes.chip}
                        onDelete={() => null}
                      />
                    ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {envs.map(({ env: envName }) => (
                  <MenuItem key={envName} value={envName}>
                    {envName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Paper>
      ))}
    </div>
  )
}
