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
  mdiAws,
} from '@mdi/js'
import { makeStyles } from '@material-ui/core/styles'
import { Project } from '#/client/dto/project'
import { Routes } from '~/components/organisms/project/api/routes'
import { Models } from '~/components/organisms/project/api/models'
import { Repositories } from '~/components/organisms/project/api/repositories'
import { Services } from '~/components/organisms/project/api/services'
import { Usecases } from '~/components/organisms/project/api/usecases'
import { Iac } from '~/components/organisms/project/api/iac'

const useStyles = makeStyles({
  btnNavigation: {
    marginTop: '3rem',
  },
})

const Case = ({ show, children }: any) => <>{show ? children : null}</>

export const ApiDetails = ({ project }: { project?: Project }) => {
  const classes = useStyles()
  const [btnNIndex, setBtnNIndex] = React.useState(0)
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
          label='Routes'
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
        <BottomNavigationAction
          label='IaC'
          icon={
            <SvgIcon>
              <path d={mdiAws} />
            </SvgIcon>
          }
        />
      </BottomNavigation>
      <Case show={btnNIndex === 0}>
        <Routes routes={project?.projectData?.openapi?.paths ?? {}} />
      </Case>
      <Case show={btnNIndex === 1}>
        <Models models={project?.projectData?.models ?? []} />
      </Case>
      <Case show={btnNIndex === 2}>
        <Repositories repositories={project?.projectData?.repositories ?? []} />
      </Case>
      <Case show={btnNIndex === 3}>
        <Services services={project?.projectData?.services ?? []} />
      </Case>
      <Case show={btnNIndex === 4}>
        <Usecases usecases={project?.projectData?.useCases ?? []} />
      </Case>
      <Case show={btnNIndex === 5}>
        <Iac routes={project?.projectData?.openapi?.paths ?? {}} />
      </Case>
    </div>
  )
}
