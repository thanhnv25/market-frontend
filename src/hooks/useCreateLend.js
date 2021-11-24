import { useCallback } from 'react'
import useNtfMarketContract from './useNtfMarketContract'
import useAlertCallback from './useAlertCallback'
import { useTranslation } from 'react-i18next'
import { saveTxPending } from '../utils/index'
import { useSelector } from 'react-redux'
import { LISTING_PRICE, NFT_ADDRESS } from '../constants'
import { ethers } from 'ethers'
import useBlock from './useBlock'

const useCreateLend = () => {
  const nftMarketContract = useNtfMarketContract()
  const alertMessage = useAlertCallback()
  const { t } = useTranslation()
  const chainId = useSelector((state) => state.provider.chainId)
  const block = useBlock()
  return useCallback(
    async (tokenId, price, blockDuration) => {
      const blockClose = block + blockDuration
      try {
        const borrowTx = await nftMarketContract.lend(
          NFT_ADDRESS[chainId],
          tokenId,
          ethers.utils.parseUnits(price, 'ether'),
          blockClose,
          {
            value: ethers.utils.parseUnits(LISTING_PRICE.toString(), 'ether').toString(),
          },
        )
        saveTxPending(borrowTx.hash, t('Lend item #{{id}}.', { id: tokenId }))
        alertMessage(t('Submitted'), t('Lend submitted'), 'success')
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    [block, chainId, nftMarketContract, alertMessage, t],
  )
}

export default useCreateLend
