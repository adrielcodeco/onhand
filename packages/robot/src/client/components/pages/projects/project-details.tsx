import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Badge from '@material-ui/core/Badge'
import Button from '@material-ui/core/Button'
import SvgIcon from '@material-ui/core/SvgIcon'
import { mdiMicrosoftVisualStudioCode } from '@mdi/js'
import { Project } from '~/models/project'
import { projectService } from '~/services/projects'
import { ApiDetails } from '~/components/api-details'

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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

export function ProjectDetails () {
  const classes = useStyles()
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = React.useState<Project | undefined>()
  React.useEffect(() => {
    projectService.find(projectId).then(setProject).catch(console.error)
  }, [])
  const openInVSCode = (projectPath?: string) => {
    if (projectPath) {
      window.location.href = `vscode://file/${projectPath}/`
    }
  }
  return (
    <div>
      <div className={classes.header}>
        <div>
          <Badge
            color='primary'
            badgeContent={project?.type}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Typography gutterBottom variant='h5' component='h1'>
              {(project?.name ?? '').toUpperCase()}
            </Typography>
          </Badge>
        </div>
        <Button
          variant='contained'
          color='primary'
          className={classes.button}
          onClick={() => openInVSCode(project?.path)}
          endIcon={
            <SvgIcon>
              <path d={mdiMicrosoftVisualStudioCode} />
            </SvgIcon>
          }
        >
          Open in VS Code
        </Button>
      </div>
      <ApiDetails project={project} />
    </div>
  )
}
