import styled from '@emotion/styled'
import * as MI from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ClassItem } from '../constants'
import useAlertCallback from '../hooks/useAlertCallback'
import useBlock from '../hooks/useBlock'
import useCancelLend from '../hooks/useCancelLend'
import useRetrieveLend from '../hooks/useRetrieveLend'
import useBorrow from '../hooks/useBorrow'

import { connectWallet } from '../utils'
import { ReactComponent as Beast } from '../assets/beast.svg'
import { ReactComponent as Plant } from '../assets/plant.svg'
import { ReactComponent as Mech } from '../assets/mech.svg'
import { ReactComponent as Bug } from '../assets/bug.svg'
import { copyBuyer, inforTx, getTxSuccess, blockRemains } from '../utils/index'
const StyledCard = styled(Box)`
  height: 340px;
  width: 225px;
  background: #2c394b;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: -2px 0px 24px #000;
  cursor: ${({ showBuyOrSellButton }) => (showBuyOrSellButton ? 'normal' : 'pointer')};
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: 0.4s ease-out;
  ${({ showBuyOrSellButton }) =>
    showBuyOrSellButton
      ? ``
      : `:hover { background: #334756; transform: translateY(-8px);
    transition: 0.4s ease-out; }`}
`
const StyledImage = styled(Box)`
  height: 200px;
  width: 225px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain, cover;
`
const StyledButton = styled(Button)`
  width: 100%;
  background: #ff4c29;
  transition: all 200ms ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  font-size: 16px;
  padding: 8px;

  :hover,
  :active,
  :focus {
    background: #ff7c62;
  }
`

export default forwardRef(function Card(props, ref) {
  const [open, setOpen] = useState(false)

  const { t } = useTranslation()
  const alertMessage = useAlertCallback()
  const { showBuyOrSellButton, history, onClose, item } = props
  const account = useSelector((state) => state.provider.account) ?? ''
  const histories = item.lendHistories
  const chainId = useSelector((state) => state.provider.chainId)
  const onCancelLend = useCancelLend()
  const onRetrieveLend = useRetrieveLend()
  const onBorrow = useBorrow()
  const isBorrowed = item.borrower !== '0x0000000000000000000000000000000000000000'
  const isLender = item.lender.toLowerCase() === account.toLowerCase()
  const icon =
    item.class === 1 ? (
      <Beast />
    ) : item.class === 2 ? (
      <Plant />
    ) : item.class === 3 ? (
      <Bug />
    ) : item.class === 4 ? (
      <Mech />
    ) : null
  return (
    <StyledCard {...props}>
      <Box padding="16px" width="100%">
        <Box display="flex" justifyContent="space-between">
          <Box>
            <div># {item.tokenId}</div>
            <Box display="flex" alignItems="flex-end" marginTop="4px">
              {icon}
              <Typography marginLeft="4px" fontSize="14px" lineHeight="normal">
                {Object.keys(ClassItem).map((i) => {
                  if (ClassItem[i] === item.class) {
                    return t(i)
                  }
                  return ''
                })}
              </Typography>
            </Box>
            {item.lender !== undefined ? <Typography marginLeft="4px" fontSize="10px" lineHeight="20px">
              {`Lender: ${item.lender.slice(0, 6)}...${item.lender.slice(item.lender.length - 4, item.lender.length)}`}
            </Typography> : null}
          </Box>
          <Box>
            <Box display="flex">
              <Box display="flex" alignItems="flex-start">
                <MI.Favorite fontSize="small" style={{ fill: '#3ac279' }} />
                <Typography fontSize="16px" lineHeight="normal">
                  {item.heath}
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start">
                <MI.FlashOn fontSize="small" style={{ fill: '#f7ac0a' }} />
                <Typography fontSize="16px" lineHeight="normal">
                  {item.speed}
                </Typography>
              </Box>
            </Box>
            <Box display="flex">
              <Box display="flex" alignItems="flex-start">
                <MI.StarRate fontSize="small" style={{ fill: '#9166e0' }} />
                <Typography fontSize="16px" lineHeight="normal">
                  {item.skill}
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start">
                <MI.LocalFireDepartment fontSize="small" style={{ fill: '#c23a3a' }} />

                <Typography fontSize="16px" lineHeight="normal">
                  {item.morale}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box width="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center" flex="1">
          <StyledImage
            style={{
              backgroundImage: `url("${item.image}")`,
            }}
          ></StyledImage>

          {showBuyOrSellButton && !isBorrowed ? (

            <Box display="flex" justifyContent="space-between">
              <Typography fontSize="14px" color="#90b8ef" fontWeight={400}>
                {item.remainBlock <= 0 ? t('Rental sesstion ended') : t('Rental end at block: ') + item.lendBlockDuration}
              </Typography>
              <MI.AccessAlarms
                onClick={() => blockRemains(chainId, item.endBlock)}
                fontSize="small"
                style={{ fill: '#c23a3a', cursor: 'pointer' }}
              />
            </Box>



          ) : null}

          {/* change to lend price */}
          <Typography fontSize="14px" lineHeight="48px" fontWeight={400}>
            {item.price === undefined ? null : item.price + ' ETH'}
          </Typography>



        </Box>
        {!account && showBuyOrSellButton && (
          <StyledButton variant="contained" style={{ margin: '8px 0' }} onClick={connectWallet}>
            {t('Connect Metamask')}
          </StyledButton>
        )}
        {/* change to cancel lend */}
        {account && showBuyOrSellButton && !isBorrowed && isLender && (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            onClick={() => {
              onCancelLend(item.id)
            }}
          >
            {t('Cancel')}
          </StyledButton>
        )}
        {account && showBuyOrSellButton && !isBorrowed && !isLender && item.remainBlock > 0 && (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            onClick={() => {
              onBorrow(item)
            }}
          >
            {t('Borrow this item')}
          </StyledButton>
        )}
        {/* change to retrive lend */}
        {account && showBuyOrSellButton && isBorrowed && isLender && item.remainBlock < 0 && (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            onClick={() => {
              onRetrieveLend(item.id)
            }}
          >
            {t('Claim')}
          </StyledButton>
        )}
      </Box>
      {
        history && (
          <Box
            style={{
              background: '#334756',
              width: '100%',
              borderRadius: '0 0 12px 12px',
              minHeight: '100px',
              padding: '16px',
              overflow: 'auto',
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize="18px" color="#ffffff" fontWeight={500}>
                {t('Borrower')}
              </Typography>
              <Typography fontSize="18px" color="#ffffff" fontWeight={500}>
                {t('Price & Time')}
              </Typography>
            </Box>
            <Box marginTop="8px" flex={1}>
              {histories?.length ? (
                histories.map((item, index) => {
                  return (
                    <Box display="flex" justifyContent="space-between">
                      <MI.CopyAllSharp

                        onClick={() => copyBuyer(item.borrower)}
                        fontSize="small"
                        style={{ fill: '#c23a3a', cursor: 'pointer' }}
                      />
                      {item.borrower !== "0x0000000000000000000000000000000000000000" ? (<Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                        {`${item.borrower.slice(0, 6)}...${item.borrower.slice(item.borrower.length - 4, item.borrower.length)}`}
                      </Typography>) : (<Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                        {`On Rental`}
                      </Typography>)}
                      <Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                        {item.price} ETH ({item.time})
                      </Typography>
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" />
                      <i class="fas fa-external-link-alt" style={{ color: "#c23a3a", cursor: "pointer", visibility: getTxSuccess()[item.itemMarketId] ? 'unset' : 'hidden' }}
                        onClick={() => inforTx(chainId, item.itemMarketId)}
                      />
                    </Box>
                  )
                })
              ) : (
                <Box display="flex" justifyContent="space-between" textAlign="center">
                  <Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                    {t('No history')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )
      }
    </StyledCard >
  )
})
