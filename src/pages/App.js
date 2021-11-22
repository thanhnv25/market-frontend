import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import { Redirect, Route, Switch } from 'react-router-dom'
import useBalance from '../hooks/useBalance'
import useLanguage from '../hooks/useLanguage'
import useProvider from '../hooks/useProvider'
import { connectWallet } from '../utils'
import './App.scss'
import Create from './Create'
import Marketplace from './Marketplace'
import MyNft from './MyNft'
import io from 'socket.io-client'

function App() {
  useProvider()
  const account = useSelector((state) => state.provider.account)
  const { pathname } = useLocation()
  const history = useHistory()
  const activeIndex =
    pathname === '/marketplace' ? 0 : pathname === '/create' ? 2 : pathname === '/mynft' ? 1 : undefined
  const { t } = useTranslation()
  const [language, toggleLanguage] = useLanguage()
  const [socketIO, setSocketIO] = useState()

  useBalance()

  useEffect(() => {
    if (!socketIO || !window.socket) {
      const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ['websocket'] })
      window.socket = socket
      setSocketIO(socket)
    }
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div style={{ flex: 1 }} />
        <nav className="nav">
          <ul>
            <li tabIndex="0" className={activeIndex === 0 ? 'active' : ''} onClick={() => history.push('/marketplace')}>
              {t('Marketplace')}
            </li>
            <li tabIndex="0" className={activeIndex === 1 ? 'active' : ''} onClick={() => history.push('/mynft')}>
              {t('My NFT')}
            </li>
            <li tabIndex="0" className={activeIndex === 2 ? 'active' : ''} onClick={() => history.push('/create')}>
              {t('Create')}
            </li>
          </ul>
        </nav>
        <div className="lng-and-account">
          <div tabIndex="0" className="lng" onClick={() => toggleLanguage()}>
            {language === 'ja-JP' ? '日本語' : 'EN'}
          </div>
          {account ? (
            <div tabIndex="0" className="account">
              {`${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}`}
            </div>
          ) : (
            <div tabIndex="0" className="account" onClick={connectWallet}>
              {t('Connect Metamask')}
            </div>
          )}
        </div>
      </header>
      <div className="app-body">
        <Switch>
          <Route exact strict path="/marketplace" component={Marketplace} />
          <Route exact strict path="/mynft" component={MyNft} />
          <Route exact strict path="/create" component={Create} />
          <Route component={() => <Redirect to="/marketplace" />} />
        </Switch>
      </div>
    </div>
  )
}

export default App
