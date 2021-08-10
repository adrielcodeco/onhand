import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import MenuIcon from '@material-ui/icons/Menu'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  container: {
    padding: '4rem',
  },
  buttons: {
    '& > *': {
      margin: '0 1rem',
    },
  },
}))

export function In ({ children }: any) {
  const classes = useStyles()
  const projectId = localStorage.getItem('current-project')
  return (
    <div>
      <CssBaseline />
      <AppBar position='static'>
        <Container>
          <Toolbar>
            <IconButton
              edge='start'
              className={classes.menuButton}
              color='inherit'
              aria-label='menu'
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' className={classes.title}>
              ONHAND ✍️
            </Typography>
            <div className={classes.buttons}>
              <Button color='inherit' href={`/projects/${projectId}`}>
                Project Details
              </Button>
              <Button color='inherit' href='/deploy/setup'>
                Deploy Setup
              </Button>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      <Container className={classes.container}>{children}</Container>
    </div>
  )
}
