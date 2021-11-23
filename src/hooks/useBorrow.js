import { useCallback } from 'react'
import useNtfMarketContract from './useNtfMarketContract'
import useAlertCallback from './useAlertCallback'
import { useTranslation } from 'react-i18next'
import { saveTxPending } from '../utils/index'
import { LISTING_PRICE } from '../constants'
import { ethers } from 'ethers'

const useBorrow = () => {
  const nftMarketContract = useNtfMarketContract()
  const alertMessage = useAlertCallback()
  const { t } = useTranslation()

  return useCallback(
    async (item) => {
      try {


        const borrowTx = await nftMarketContract.borrow(item.id, { value: ethers.utils.parseUnits(item.price.toString(), 'ether').toString() })
        saveTxPending(borrowTx.hash, t('Borrow lend item #{{id}}.', { id: item.Id }))
        alertMessage(t('Submitted'), t('Borrow lend item submitted'), 'success')
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    [nftMarketContract, alertMessage, t],
  )
}

export default useBorrow
