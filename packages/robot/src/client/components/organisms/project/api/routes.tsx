import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Link from '@material-ui/core/Link'
import { Title } from '~/components/molecules/title'

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

export const Routes = ({ routes }: { routes: any[] }) => {
  const classes = useStyles()
  const { projectId } = useParams<{ projectId: string }>()
  return (
    <div>
      <Title
        title='Routes'
        button={{ text: 'ADD ROUTE', href: `/projects/${projectId}/routes` }}
      />
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Method</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Authenticated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map(row => (
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
