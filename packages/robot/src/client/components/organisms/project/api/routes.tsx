import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import { Title } from '~/components/molecules/title'
import Tooltip from '@material-ui/core/Tooltip'
import { OpenApiOperationListItem } from '~/components/molecules/openapiOperationListItem'
import { ApiRouteDetails } from '~/components/molecules/apiRouteDetails'

const useStyles = makeStyles(theme => ({
  toolbox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 15px',
  },
  titleDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
}))

export const Routes = ({ routes }: any) => {
  const classes = useStyles()
  const { projectId } = useParams()
  const [selected, setSelected] = React.useState<any>(undefined)
  const [search, setSearch] = React.useState('')
  const [expandeds, setExpandeds] = React.useState<any>({})
  const [specs, setSpecs] = React.useState<
  Array<{ path: string, method: string } & any>
  >([])
  const [groups, setGroups] = React.useState<any[]>([])
  const showDetails = !!selected
  React.useEffect(() => {
    const _expandeds: any = {}
    const paths = []
    const _specs = []
    for (const path in routes) {
      paths.push(path)
      for (const method in routes[path]) {
        const spec = routes[path][method]
        const regex = new RegExp(search, 'ig')
        if (regex.test(path) || regex.test(spec.description)) {
          _specs.push({ path, method, ...spec })
        }
      }
    }
    const _groups = _specs
      .map(spec => spec.path.split('/')[1])
      .filter((value, index, self) => self.indexOf(value) === index)
    for (const group of _groups) {
      _expandeds[group] = true
    }
    setExpandeds(_expandeds)
    setSpecs(_specs)
    setGroups(_groups)
  }, [routes, search])
  const openDetails = (path: string, method: string) => {
    if (selected?.path !== path || selected?.method !== method) {
      setSelected({ path, method })
    }
  }
  const expandAll = () => {
    const _expandeds = { ...expandeds }
    for (const group of groups) {
      _expandeds[group] = true
    }
    setExpandeds(_expandeds)
  }
  const collapseAll = () => {
    const _expandeds = { ...expandeds }
    for (const group of groups) {
      _expandeds[group] = false
    }
    setExpandeds(_expandeds)
  }
  return (
    <div>
      <Title
        title='Routes'
        button={{ text: 'ADD ROUTE', href: `/projects/${projectId}/routes` }}
      />
      <Grid container spacing={3}>
        <Grid item xs={showDetails ? 4 : 12}>
          <Paper className={classes.toolbox}>
            <InputBase
              className={classes.input}
              placeholder='Search'
              value={search}
              onChange={event => setSearch(event.target.value)}
              inputProps={{ 'aria-label': 'search' }}
            />
            <div>
              <Tooltip title='Expand all' aria-label='Expand all'>
                <IconButton onClick={expandAll}>
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Collapse all' aria-label='Collapse all'>
                <IconButton onClick={collapseAll}>
                  <ExpandLessIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Paper>
          {groups.map(group => (
            <Accordion
              key={group}
              onChange={(event: any, expanded: boolean) => {
                const _expandeds = { ...expandeds }
                _expandeds[group] = expanded
                setExpandeds(_expandeds)
              }}
              expanded={expandeds[group]}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h5'>{group}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.list}>
                  {specs
                    .filter(spec => spec.path.startsWith(`/${group}`))
                    .map(({ path, method, operationId, description }: any) => (
                      <OpenApiOperationListItem
                        key={operationId}
                        method={method}
                        path={path}
                        description={description}
                        authenticated
                        compact={showDetails}
                        onClick={() => openDetails(path, method)}
                      />
                    ))}
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
        {showDetails
          ? (
            <Grid item xs={8}>
              <ApiRouteDetails
                path={selected.path}
                method={selected.method}
                spec={routes[selected.path][selected.method]}
                onClose={() => setSelected(undefined)}
              />
            </Grid>
            )
          : null}
      </Grid>
    </div>
  )
}
