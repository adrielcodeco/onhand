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
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import SvgIcon from '@material-ui/core/SvgIcon'
import Typography from '@material-ui/core/Typography'
import { mdiMicrosoftVisualStudioCode } from '@mdi/js'
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
  path: {
    color: 'gray',
  },
})

export const Usecases = ({ usecases }: { usecases: any[] }) => {
  const classes = useStyles()
  const { projectId } = useParams()
  const openInVSCode = (path: string) => () => {
    if (path) {
      // https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls
      window.location.href = `vscode://file/${path}/`
    }
  }
  return (
    <div>
      <Title
        title='Use Cases'
        button={{
          text: 'ADD USE CASE',
          href: `/projects/${projectId}/usecase`,
        }}
      />
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usecases
              .filter(i => !i.isExternal)
              .map(row => (
                <TableRow key={row.name}>
                  <TableCell>
                    <Typography variant='h6'>{row.name}</Typography>
                    <Typography variant='body2' className={classes.path}>
                      {row.relativePath}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Tooltip
                      title='Open in VS Code'
                      aria-label='Open in VS Code'
                    >
                      <IconButton onClick={openInVSCode(row.filePath)}>
                        <SvgIcon>
                          <path d={mdiMicrosoftVisualStudioCode} />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
