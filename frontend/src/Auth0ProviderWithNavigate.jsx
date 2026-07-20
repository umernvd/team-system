import { Auth0Provider } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { domain, clientId, audience } from './config'

export default function Auth0ProviderWithNavigate({ children }) {
  const navigate = useNavigate()

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname)
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  )
}
