import { useCallback } from 'react'
import useNtfMarketContract from './useNtfMarketContract'
import useAlertCallback from './useAlertCallback'
import { useTranslation } from 'react-i18next'
import { saveTxPending } from '../utils/index'
 
const useRetrieveLend = () => {
  const nftMarketContract = useNtfMarketContract()
  const alertMessage = useAlertCallback()
  const { t } = useTranslation()

  return useCallback(
    async (itemId) => {
      try {
        const cancelItemTx = await nftMarketContract.retrieve(itemId)
        saveTxPending(cancelItemTx.hash, t('Retrieve lend item #{{id}}.', {id: itemId}))
        alertMessage(t('Submitted'), t('Retrieve lend item submitted'), 'success')
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    [nftMarketContract, alertMessage, t],
  )
}

export default useRetrieveLend
