import React from 'react'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import SvgIcon from '@material-ui/core/SvgIcon'
import {
  mdiRoutes,
  mdiTable,
  mdiTableNetwork,
  mdiArrowDecisionOutline,
  mdiDomain,
} from '@mdi/js'
import { makeStyles } from '@material-ui/core/styles'
import { Routes } from '~/components/organisms/project/api/routes'

const useStyles = makeStyles({
  btnNavigation: {
    marginTop: '3rem',
  },
})

export const ApiDetails = ({ project }: { project: any }) => {
  const classes = useStyles()
  const [btnNIndex, setBtnNIndex] = React.useState(0)
  const routes: any[] = project?.routes ?? []
  return (
    <div>
      <BottomNavigation
        value={btnNIndex}
        onChange={(event, newValue) => {
          setBtnNIndex(newValue)
        }}
        showLabels
        className={classes.btnNavigation}
      >
        <BottomNavigationAction
          label='Rotues'
          icon={
            <SvgIcon>
              <path d={mdiRoutes} />
            </SvgIcon>
          }
        />
        <BottomNavigationAction
          label='Models'
          icon={
            <SvgIcon>
              <path d={mdiTable} />
            </SvgIcon>
          }
        />
        <BottomNavigationAction
          label='Repositories'
          icon={
            <SvgIcon>
              <path d={mdiTableNetwork} />
            </SvgIcon>
          }
        />
        <BottomNavigationAction
          label='Service'
          icon={
            <SvgIcon>
              <path d={mdiArrowDecisionOutline} />
            </SvgIcon>
          }
        />
        <BottomNavigationAction
          label='Use Case'
          icon={
            <SvgIcon>
              <path d={mdiDomain} />
            </SvgIcon>
          }
        />
      </BottomNavigation>
      <Routes routes={routes} />
    </div>
  )
}
