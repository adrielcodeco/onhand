import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

const getColors = { fill: '#61affe', bg: 'rgba(97,175,254,.1)' }
const postColors = { fill: '#49cc90', bg: 'rgba(73,204,144,.1)' }
const putColors = { fill: '#fca130', bg: 'rgba(252,161,48,.1)' }
const deleteColors = { fill: '#f93e3e', bg: 'rgba(249,62,62,.1)' }

const useStyles = makeStyles({
  controls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #000',
    borderRadius: '4px',
    boxShadow: '0 0 3px rgb(0 0 0 / 19%)',
    margin: '15px',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #000',
    margin: '0 0 15px',
    padding: '5px 0',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    '& > *': {
      margin: '0 5px',
    },
  },
  method: {
    borderRadius: '3px',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    fontWeight: 700,
    minWidth: '80px',
    padding: '6px 0px',
    textAlign: 'center',
    textShadow: '0 1px 0 rgb(0 0 0 / 10%)',
  },
  path: {
    fontWeight: 'bold',
  },
  desc: {
    color: 'gray',
  },
  lock: {
    margin: '0 5px',
    color: 'gray',
  },
  'box-get': {
    borderColor: getColors.fill,
    background: getColors.bg,
  },
  'method-get': {
    background: getColors.fill,
  },
  'box-post': {
    borderColor: postColors.fill,
    background: postColors.bg,
  },
  'method-post': {
    background: postColors.fill,
  },
  'box-put': {
    borderColor: putColors.fill,
    background: putColors.bg,
  },
  'method-put': {
    background: putColors.fill,
  },
  'box-delete': {
    borderColor: deleteColors.fill,
    background: deleteColors.bg,
  },
  'method-delete': {
    background: deleteColors.fill,
  },
  summary: {
    color: '#3b4151',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    margin: '0 0 5px',
    padding: '15px 20px',
  },
  dividerTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'hsla(0,0%,100%,.8)',
    boxShadow: '0 1px 2px rgb(0 0 0 / 10%)',
    minHeight: '50px',
    padding: '8px 20px',
    '& > p': {
      color: '#3b4151',
      flex: 1,
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      margin: 0,
    },
  },
  hAlignment: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  table: {
    backgroundColor: 'transparent',
    margin: '15px',
  },
  td: {
    border: 0,
  },
  responseTypeLabel: {
    padding: '0 10px 0 0',
    color: '#3b4151',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    fontWeight: 700,
  },
  responseType: {
    minWidth: '230px',
  },
  empty: {
    margin: '0 0 5px',
    padding: '15px 20px',
  },
})

export interface ApiRouteDetailsProps {
  path: string
  method: string
  spec: any
  onClose: () => void
}

export const ApiRouteDetails = ({
  path,
  method,
  spec,
  onClose,
}: ApiRouteDetailsProps) => {
  const classes = useStyles()
  const { summary, parameters, responses } = spec
  return (
    <Paper>
      <div className={classes.controls}>
        <div />
        <IconButton aria-label='close' onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div
        className={[classes.box, (classes as any)[`box-${method}`]].join(' ')}
      >
        <div
          className={[classes.header, (classes as any)[`box-${method}`]].join(
            ' ',
          )}
        >
          <div className={classes.headerLeft}>
            <span
              className={[
                classes.method,
                (classes as any)[`method-${method}`],
              ].join(' ')}
            >
              {method.toUpperCase()}
            </span>
            <Typography variant='subtitle1' className={classes.path}>
              {path}
            </Typography>
            <Typography variant='body2' className={classes.desc}>
              {spec.description}
            </Typography>
          </div>
        </div>
        <p className={classes.summary}>{summary}</p>
        <div className={classes.dividerTitle}>
          <p>Parameters</p>
        </div>
        {parameters?.length
          ? (
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parameters?.map(row => (
                  <TableRow key={row.name}>
                    <TableCell className={classes.td}>{row.name}</TableCell>
                    <TableCell className={classes.td}>
                      {row.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
          : (
            <p className={classes.empty}>No parameters</p>
            )}
        <div className={classes.dividerTitle}>
          <p>Responses</p>
          <div className={classes.hAlignment}>
            <p className={classes.responseTypeLabel}>Response content type</p>
            <Select className={classes.responseType}>
              <MenuItem value='application/json'>application/json</MenuItem>
            </Select>
          </div>
        </div>
        {responses?.length
          ? (
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses?.map(row => (
                  <TableRow key={row.name}>
                    <TableCell className={classes.td}>{row.name}</TableCell>
                    <TableCell className={classes.td}>
                      {row.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
          : (
            <p className={classes.empty}>No responses</p>
            )}
      </div>
      <br />
    </Paper>
  )
}
