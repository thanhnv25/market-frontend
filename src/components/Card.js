import styled from '@emotion/styled'
import * as MI from '@mui/icons-material'
import { Box, Button, Switch, Typography, FormControl, InputLabel, MenuItem } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ClassItem } from '../constants'
import useAlertCallback from '../hooks/useAlertCallback'
import useApproveAll from '../hooks/useApproveAll'
import useBuyNft from '../hooks/useBuyNft'
import useMakeOffer from '../hooks/useMakeOffer'
import useSellNft from '../hooks/useSellNft'
import useCreateLend from '../hooks/useCreateLend'
import useClaimReward from '../hooks/useClaimReward'
import useBlock from '../hooks/useBlock'
import OfferDialog from './OfferDialog'
import { CssTextField, CssTimeTextField, StyledSelect } from '../pages/Create'
import { connectWallet, timeToBlockNumber } from '../utils'
import { ReactComponent as Beast } from '../assets/beast.svg'
import { ReactComponent as Plant } from '../assets/plant.svg'
import { ReactComponent as Mech } from '../assets/mech.svg'
import { ReactComponent as Bug } from '../assets/bug.svg'
import useCancelMarketItem from '../hooks/useCancelMarketItem'
import useCancelMarketItemAuction from '../hooks/useCancelMarketItemAuction'
import useLevelUp from '../hooks/useLevelUp'
import { copyBuyer, blockRemains } from '../utils/index'
import { EXPLORER_TX } from '../constants/index'

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

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const handleChange = (event) => {
    setOption(event.target.value)
  }
  const { t } = useTranslation()
  const alertMessage = useAlertCallback()
  const [minSellPrice, setMinSellPrice] = useState('')
  const [maxSellPrice, setMaxSellPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [lendPrice, setLendPrice] = useState('')
  const { showBuyOrSellButton, history, onClose, item } = props
  const [isBuyDirectly, setIsBuyDirectly] = useState(item.minPrice === item.price && item.seller !== undefined)

  const account = useSelector((state) => state.provider.account) ?? ''
  const onBuy = useBuyNft()
  const onOffer = useMakeOffer()
  const onSell = useSellNft()
  const onLevelUp = useLevelUp()
  const onCreateLend = useCreateLend()
  const { onApprove } = useApproveAll()
  const isApprove = useSelector((state) => state.provider.isApprovedForAll)
  const sellHistories = item.sellHistories
  const chainId = useSelector((state) => state.provider.chainId)
  const onCancelMarketItem = useCancelMarketItem()
  const onCancelMarketItemAuction = useCancelMarketItemAuction()
  const onClaimReward = useClaimReward()
  const block = useBlock()
  const [option, setOption] = useState(1)

  const isEndAuction = block >= item.endBlock
  const offers = item.offers
  const isSell = item.buyer !== '0x0000000000000000000000000000000000000000'
  const isMySell = !isSell && item.seller.toLowerCase() === account.toLowerCase()
  const isMyNft = item.buyer === undefined && item.seller === undefined
  const isOwner =
    (item.buyer !== undefined && item.buyer.toLowerCase() === account.toLowerCase()) ||
    (item.owner !== undefined && item.owner.toLowerCase() === account.toLowerCase())
  const [blockNumber, setBlockNumber] = useState(0)
  const [blockDuration, setBlockDuration] = useState(0)
  var currentdate = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0]
  const isLock = item.lock
  let isLatestOffer = false
  if (offers && offers.length > 0) {
    isLatestOffer = offers[0].asker.toLowerCase() === account.toLowerCase()
  }
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
            {item.seller !== undefined ? (
              <Typography marginLeft="4px" fontSize="10px" lineHeight="20px">
                {`Seller: ${item.seller.slice(0, 6)}...${item.seller.slice(
                  item.seller.length - 4,
                  item.seller.length,
                )}`}
              </Typography>
            ) : null}
          </Box>
          {isMyNft && showBuyOrSellButton && (
            <Box>
              <MI.ControlPoint
                cursor="pointer"
                fontSize="large"
                onClick={() => {
                  onLevelUp(item.tokenId)
                }}
              />
            </Box>
          )}
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
          />
          {/* select box */}
          {showBuyOrSellButton && isOwner && !isLock && (
            <Box style={{ borderColor: '#ffffff', marginTop: '20px' }} sx={{ minWidth: 120 }}>
              <FormControl style={{ borderColor: '#ffffff' }} fullWidth>
                <InputLabel style={{ color: '#ffffff' }}>Action</InputLabel>
                <StyledSelect
                  style={{ color: '#ffffff' }}
                  width="20vw"
                  value={option}
                  label="Action"
                  onChange={handleChange}
                >
                  <MenuItem value={1}>Sell directly</MenuItem>
                  <MenuItem value={2}>Create auction</MenuItem>
                  <MenuItem value={3}>Up for rent</MenuItem>
                </StyledSelect>
              </FormControl>
            </Box>
          )}

          {showBuyOrSellButton && !isMySell && !isOwner && !isLock ? (
            <Switch
              defaultChecked={false}
              disabled={item.minPrice === item.price}
              checked={!isBuyDirectly}
              onChange={(e) => {
                setIsBuyDirectly(!e.target.checked)
              }}
            />
          ) : null}
          {showBuyOrSellButton && !isBuyDirectly && !isLock && (!isSell || isMySell) ? (
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize="14px" color="#90b8ef" fontWeight={400}>
                {item.remainBlock <= 0 ? t('Auction ended') : t('Auction end at block: ') + item.endBlock}
              </Typography>
              <MI.AccessAlarms
                onClick={() => blockRemains(chainId, item.endBlock)}
                fontSize="small"
                style={{ fill: '#c23a3a', cursor: 'pointer' }}
              />
            </Box>
          ) : null}
          {showBuyOrSellButton && isSell && !isLock && isApprove && option === 2 ? (
            <Box>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '10px -5px 24px',
                }}
              >
                <CssTextField
                  style={{ margin: '0 5px' }}
                  width="50%"
                  unit="ETH"
                  type="number"
                  label={t('Min Price')}
                  variant="filled"
                  myBackgroundColor="#ffffff"
                  myColor="#ffffff"
                  value={minSellPrice}
                  onChange={(e) => {
                    setMinSellPrice(e.target.value)
                  }}
                />
                <CssTextField
                  width="50%"
                  unit="ETH"
                  type="number"
                  label={t('Max Price')}
                  variant="filled"
                  myBackgroundColor="#ffffff"
                  myColor="#ffffff"
                  value={maxSellPrice}
                  onChange={(e) => {
                    setMaxSellPrice(e.target.value)
                  }}
                />
              </div>
              <CssTimeTextField
                id="datetime-local"
                label="Auction close"
                type="datetime-local"
                style={{ margin: '0 0 12px' }}
                inputProps={{
                  min: currentdate,
                }}
                defaultValue={currentdate}
                InputLabelProps={{
                  shrink: true,
                }}
                width="100%"
                onChange={(e) => setBlockNumber(timeToBlockNumber(e.target.value, chainId))}
              />
              <Typography
                style={{ margin: '0 0 12px' }}
                color={blockNumber >= 10 ? '#ffffff' : '#c23a3a'}
                width="100%"
                fontSize="12px"
                fontWeight={400}
              >
                {t('Number of block to close: ') + blockNumber}
              </Typography>
            </Box>
          ) : showBuyOrSellButton && isSell && isApprove && !isLock && option === 1 ? (
            <Box>
              <CssTextField
                style={{ marginTop: '20px' }}
                width="100%"
                unit="ETH"
                type="number"
                label={t('Price')}
                variant="filled"
                myBackgroundColor="#ffffff"
                myColor="#ffffff"
                value={sellPrice}
                onChange={(e) => {
                  setSellPrice(e.target.value)
                }}
              />
            </Box>
          ) : showBuyOrSellButton && isSell && isApprove && !isLock && option === 3 ? (
            <Box>
              <CssTextField
                style={{ marginTop: '20px', marginBottom: '20px' }}
                width="100%"
                unit="ETH"
                type="number"
                label={t('Price')}
                variant="filled"
                myBackgroundColor="#ffffff"
                myColor="#ffffff"
                value={lendPrice}
                onChange={(e) => {
                  setLendPrice(e.target.value)
                }}
              />
              <CssTimeTextField
                id="datetime-local"
                label={option === 2 ? 'Auction close' : 'Rent close'}
                type="datetime-local"
                style={{ margin: '0 0 12px' }}
                inputProps={{
                  min: currentdate,
                }}
                defaultValue={currentdate}
                InputLabelProps={{
                  shrink: true,
                }}
                width="100%"
                onChange={(e) => setBlockDuration(timeToBlockNumber(e.target.value, chainId))}
              />
              <Typography
                style={{ margin: '0 0 12px' }}
                color={blockNumber >= 10 ? '#ffffff' : '#c23a3a'}
                width="100%"
                fontSize="12px"
                fontWeight={400}
              >
                {t('Number of block to close: ') + blockDuration}
              </Typography>
            </Box>
          ) : showBuyOrSellButton && isLock ?
            <div style = {{display: 'block'}}>
              <MI.LockRounded fontSize="medium" 
                style={{ fill: '#c23a3a', marginTop: "12px",width: "100%" }}>
              </MI.LockRounded>
              <Typography
                style={{}}
                color={'#d96a6c'}
                fontSize="12px"
              >
                {t('item is locked')}
              </Typography>
            </div>
            : item.minPrice !== item.price ? (
              <Typography fontSize="14px" lineHeight="48px" fontWeight={400}>
                {item.minPrice + ' to ' + item.price + ' ETH'}
              </Typography>
            ) : (
              <Typography fontSize="14px" lineHeight="48px" fontWeight={400}>
                {item.price === undefined ? null : item.price + ' ETH'}
              </Typography>
            )}
          {showBuyOrSellButton && !isMySell && !isOwner && !isBuyDirectly && !isEndAuction ? (
            <CssTextField
              width="60%"
              unit="ETH"
              type="number"
              disabled={item.remainBlock <= 0 && !isBuyDirectly}
              label={t('Offer amount')}
              variant="filled"
              myBackgroundColor="#ffffff"
              myColor="#ffffff"
              value={offerPrice}
              onChange={(e) => {
                setOfferPrice(e.target.value)
              }}
            />
          ) : null}
          {showBuyOrSellButton && !isOwner && !isBuyDirectly && (item.currentPrice > 0 || offers?.length > 0) ? (
            <div>
              <br />
              <Button variant="outlined" onClick={handleClickOpen}>
                List Offer
              </Button>
              <OfferDialog listOffer={offers} open={open} onClose={handleClose} />
            </div>
          ) : showBuyOrSellButton && !isOwner && !isBuyDirectly ? (
            <Typography color="#718099" fontSize="12px" lineHeight="20px" fontWeight={400}>
              {t('No offer')}
            </Typography>
          ) : null}

          {showBuyOrSellButton && !isOwner && !isBuyDirectly && item.currentPrice > 0 ? (
            <Typography color="#718099" fontSize="12px" lineHeight="20px" fontWeight={400}>
              {t('Latest price: ') + item.currentPrice} ETH
            </Typography>
          ) : null}
        </Box>
        {!account && showBuyOrSellButton ? (
          <StyledButton variant="contained" style={{ margin: '8px 0' }} onClick={connectWallet}>
            {t('Connect Metamask')}
          </StyledButton>
        ) : account && !isApprove && showBuyOrSellButton && isSell && !isLock ? (
          <StyledButton variant="contained" style={{ margin: '8px 0' }} onClick={onApprove}>
            {t('Approve NFT')}
          </StyledButton>
        ) : account && showBuyOrSellButton && isMySell ? (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            disabled = {(item.currentPrice > 0 || offers?.length > 0)}
            onClick={() => {
              let isAuction = false
              if (item.minPrice !== item.maxPrice) isAuction = true
              if (!isAuction) onCancelMarketItem(item.id)
              else onCancelMarketItemAuction(item.id)
            }}
          >
            {t('Cancel')}
          </StyledButton>
        ) : account && showBuyOrSellButton && !isMySell && (!isOwner || isApprove) && isLatestOffer && isEndAuction ? (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            onClick={() => {
              onClaimReward(item, offers[0])
            }}
          >
            {t('Claim')}
          </StyledButton>
        ) : account && showBuyOrSellButton && !isMySell && !isLock ? (
          <StyledButton
            variant="contained"
            style={{ margin: '8px 0' }}
            disabled={item.remainBlock <= 0 && !isBuyDirectly}
            onClick={() => {
              onClose && onClose()
              if (isSell && isApprove && option === 2) {
                // Create auction.
                if (!minSellPrice || !maxSellPrice) {
                  alertMessage(t('Error'), t('Please fill input'), 'error')
                }
                if (minSellPrice && parseFloat(minSellPrice) === 0) {
                  alertMessage(t('Error'), t('Min sell price must greater than 0'), 'error')
                }
                if (maxSellPrice && parseFloat(maxSellPrice) === 0) {
                  alertMessage(t('Error'), t('Min sell price must greater than 0'), 'error')
                }
                if (blockNumber < 10) {
                  alertMessage(t('Error'), t('Number of block must >= 10 '), 'error')
                  return
                }
                onSell(item, minSellPrice, maxSellPrice, blockNumber)
                return
              }
              if (isSell && isApprove && option === 1) {
                // Sell directly.
                if (!sellPrice) {
                  alertMessage(t('Error'), t('Please fill input'), 'error')
                }
                if (sellPrice && parseFloat(sellPrice) === 0) {
                  alertMessage(t('Error'), t('Sell price must greater than 0'), 'error')
                }
                onSell(item, sellPrice, sellPrice, blockNumber)
                return
              }
              if (isSell && isApprove && option === 3) {
                // Rent
                if (!lendPrice) {
                  alertMessage(t('Error'), t('Please fill input'), 'error')
                }
                if (lendPrice && parseFloat(lendPrice) === 0) {
                  alertMessage(t('Error'), t('Lend price must greater than 0'), 'error')
                }
                onCreateLend(item.tokenId, lendPrice, blockDuration)
                return
              }
              if (!isBuyDirectly) {
                if (parseFloat(offerPrice) < item.currentPrice) {
                  alertMessage(t('Error'), t('Offer amount must greater than current price'), 'error')
                }
                onOffer(item, offerPrice)
                return
              }
              if (isBuyDirectly) {
                onBuy(item)
                return
              }
            }}
          >
            {isSell && isApprove && !isLock && option !== 3
              ? t('Sell')
              : isSell && isApprove
              ? t('Up for rent')
              : isBuyDirectly
              ? t('Buy Directly')
              : !isEndAuction
              ? t('Make Offer')
              : t('Auction is ended')}
          </StyledButton>
        ) : null}
      </Box>
      {history && (
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
              {t('Buyer')}
            </Typography>
            <Typography fontSize="18px" color="#ffffff" fontWeight={500}>
              {t('Price & Time')}
            </Typography>
          </Box>
          <Box marginTop="8px" flex={1}>
            {sellHistories?.length ? (
              sellHistories.map((item, index) => {
                return (
                  <Box display="flex" justifyContent="space-between">
                    <MI.CopyAllSharp
                      onClick={() => copyBuyer(item.buyer)}
                      fontSize="small"
                      style={{ fill: '#c23a3a', cursor: 'pointer' }}
                    />
                    <Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                      {`${item.buyer.slice(0, 6)}...${item.buyer.slice(item.buyer.length - 4, item.buyer.length)}`}
                    </Typography>
                    <Typography fontSize="14px" color="#ffffff" fontWeight={500}>
                      {item.price} ETH ({item.time})
                    </Typography>
                    <link
                      rel="stylesheet"
                      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
                    />
                    <i
                      className="fas fa-external-link-alt"
                      style={{
                        marginTop: '2px',
                        color: '#c23a3a',
                        cursor: 'pointer',
                        visibility: item.transactionHash ? 'unset' : 'hidden',
                      }}
                      onClick={() => window.open(EXPLORER_TX[chainId] + item.transactionHash)}
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
      )}
    </StyledCard>
  )
})
