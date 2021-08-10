import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import SvgIcon from '@material-ui/core/SvgIcon'
import { mdiArrowRightBoldHexagonOutline, mdiArrowRightThick } from '@mdi/js'
import { Title } from '~/components/molecules/title'
import { PromoteFunction } from '~/components/molecules/promoteFunction'
import { Env } from '~/dto/env'
import { envsService } from '~/services/envs'
import { functionsService } from '~/services/functions'

const useStyles = makeStyles(theme => ({
  titleDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolbox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 15px',
    height: '48px',
    marginBottom: '1rem',
  },
  table: {
    minWidth: 650,
  },
  path: {
    color: 'gray',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

export const Iac = ({ routes }: { routes: any }) => {
  const classes = useStyles()
  const { projectId } = useParams<{ projectId: string }>()
  const [blocked, setBlocked] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [specs, setSpecs] = React.useState<any[]>([])
  const [versions, setVersions] = React.useState<any>({})
  const [functionVersions, setFunctionVersions] = React.useState<any>({})
  const [envs, setEnvs] = React.useState<Env[]>([])
  const [promote, setPromote] = React.useState<{
    env: string
    operationId?: string
    version?: string
  }>()
  React.useEffect(() => {
    setBlocked(true)
    envsService
      .list(projectId)
      .then(async envs => {
        setEnvs(envs)
        return Promise.all(
          envs.map(async env =>
            functionsService
              .list(projectId, env.name)
              .then(functions => ({ [env.name]: functions })),
          ),
        ).then(results => {
          const result = {}
          for (const r of results) {
            Object.assign(result, r)
          }
          setFunctionVersions(result)
          setBlocked(false)
        })
      })
      .catch(console.error)
  }, [routes])
  React.useEffect(() => {
    const _specs: any[] = []
    const _versions: any = {}
    for (const path in routes) {
      for (const method in routes[path]) {
        const spec = routes[path][method]
        const regex = new RegExp(search, 'ig')
        if (regex.test(path) || regex.test(spec.description)) {
          _specs.push({ path, method, ...spec })
          for (const env of envs) {
            if (_versions[spec.operationId] === undefined) {
              _versions[spec.operationId] = {}
            }
            const version =
              env.name in functionVersions &&
              spec.operationId in functionVersions[env.name]
                ? functionVersions[env.name][spec.operationId]
                : '-'
            _versions[spec.operationId][env.name] = version
          }
        }
      }
    }
    setSpecs(_specs)
    setVersions(_versions)
  }, [envs, search, functionVersions])
  const getVersion = (operationId: string, env: string) => {
    return operationId in versions && env in versions[operationId]
      ? versions[operationId][env]
      : '-'
  }
  return (
    <div>
      <Title title='IaC' />
      <Paper className={classes.toolbox}>
        <InputBase
          className={classes.input}
          placeholder='Search'
          value={search}
          onChange={event => setSearch(event.target.value)}
          inputProps={{ 'aria-label': 'search' }}
        />
      </Paper>
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>function</TableCell>
              {envs.map(env => (
                <React.Fragment key={env.name}>
                  <TableCell align='center'>{env.name.toUpperCase()}</TableCell>
                  {env.canBePromotedTo.length
                    ? (
                      <TableCell align='center'>
                        <Tooltip
                          title='Promote all versions'
                          aria-label='Promote all versions'
                        >
                          <IconButton
                            onClick={() =>
                              setPromote({
                                env: env.name,
                              })}
                          >
                            <SvgIcon>
                              <path d={mdiArrowRightBoldHexagonOutline} />
                            </SvgIcon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      )
                    : null}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {specs.map(row => (
              <TableRow key={row.name}>
                <TableCell>{row.operationId}</TableCell>
                {envs.map(env => (
                  <React.Fragment key={`${env.name}:${row.operationId}`}>
                    <TableCell align='center'>
                      {getVersion(row.operationId, env.name)}
                    </TableCell>
                    {env.canBePromotedTo.length
                      ? (
                        <TableCell align='center'>
                          {getVersion(row.operationId, env.name) !== '-'
                            ? (
                              <Tooltip
                                title='Promote version'
                                aria-label='Promote version'
                              >
                                <IconButton
                                  onClick={() =>
                                    setPromote({
                                      env: env.name,
                                      operationId: row.operationId,
                                      version: getVersion(
                                        row.operationId,
                                        env.name,
                                      ),
                                    })}
                                >
                                  <SvgIcon>
                                    <path d={mdiArrowRightThick} />
                                  </SvgIcon>
                                </IconButton>
                              </Tooltip>
                              )
                            : null}
                        </TableCell>
                        )
                      : null}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PromoteFunction
        promote={promote}
        envs={envs}
        specs={specs}
        onClose={() => setPromote(undefined)}
      />
      <Backdrop className={classes.backdrop} open={blocked}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  )
}
