import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { profilesService } from '#/client/services/profiles'

const useStyles = makeStyles({ root: {} })

export const ProfileForm = () => {
  const classes = useStyles()
  const [profiles, setProfiles] = React.useState<any[]>([])
  React.useEffect(() => {
    profilesService.list().then(setProfiles).catch(console.error)
  }, [])
  return (
    <div className={classes.root}>
      <div>
        <h4>Chose a existing profile</h4>
        {profiles.map(profile => (
          <button key={profile.profileName}>{profile.profileName}</button>
        ))}
      </div>
      <div>
        <h4>Or Save a new</h4>
        <TextField required label='Profile name' />
        <TextField required label='AWS Access Key' />
        <TextField required label='AWS Secret Access Key' />
        <TextField required label='AWS Default Region' />
      </div>
    </div>
  )
}
