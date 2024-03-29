import React from 'react'
import ReactDOM from 'react-dom'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
// import CircularProgress from '@material-ui/core/CircularProgress'
import deepPurple from '@material-ui/core/colors/deepPurple'
import yellow from '@material-ui/core/colors/yellow'
// import { SnackbarProvider } from 'notistack'
import { ConfigContext } from '~/contexts/config'
import { configService } from '~/services/config'
// import { Container } from '~/components/templates/container'
// import { DeploySetup } from '~/components/pages/deploy/deploy-setup'
// import { ProjectList } from '~/components/pages/projects/project-list'
// import { ProjectAdd } from '~/components/pages/projects/project-add'
// import { ProjectDetails } from '~/components/pages/projects/project-details'
// import { Index } from '~/components/pages/index'

const theme = createTheme({
  palette: {
    primary: deepPurple,
    secondary: yellow,
  },
})

export const App = () => {
  const [config, setConfig] = React.useState<any>()
  React.useEffect(() => {
    configService.fetch().then(setConfig).catch(console.error)
  }, [])
  return (
    <ThemeProvider theme={theme}>
      <ConfigContext.Provider value={config}>
        {/* <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <BrowserRouter>
            <Container>
              {config
                ? (
                  <Routes>
                    <Route path='/home' element={<Index />} />
                    <Route path='/deploy/setup' element={<DeploySetup />} />
                    <Route path='/projects' element={<ProjectList />} />
                    <Route path='/projects/new' element={<ProjectAdd />} />
                    <Route
                      path='/projects/:projectId'
                      element={<ProjectDetails />}
                    />
                    <Route
                      path='*'
                      element={
                        <Navigate to={config.initialPage} replace />
                    }
                    />
                  </Routes>
                  )
                : (
                  <CircularProgress />
                  )}
            </Container>
          </BrowserRouter>
        </SnackbarProvider> */}
      </ConfigContext.Provider>
    </ThemeProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
