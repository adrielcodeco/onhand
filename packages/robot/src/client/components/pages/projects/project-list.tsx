import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Link from '@material-ui/core/Link'
import { Project } from '~/dto/project'
import { projectService } from '~/services/projects'

const useStyles = makeStyles({
  titleDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table: {
    minWidth: 650,
  },
})

export function ProjectList () {
  const classes = useStyles()
  const [projects, setProjects] = React.useState<Project[]>([])
  React.useEffect(() => {
    if (localStorage.getItem('current-project')) {
      localStorage.removeItem('current-project')
      window.location.reload()
      return
    }
    projectService.list().then(setProjects).catch(console.error)
  }, [])
  return (
    <div>
      <div className={classes.titleDiv}>
        <h1>Projects</h1>
        <Button variant='contained' href='/projects/new'>
          ADD PROJECT
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Path</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(row => (
              <TableRow key={row.id}>
                <TableCell component='th' scope='row'>
                  <Link href={`/projects/${row.id}`}>{row.name}</Link>
                </TableCell>
                <TableCell>{row.type.toUpperCase()}</TableCell>
                <TableCell>{row.path}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
