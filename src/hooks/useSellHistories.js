import { ethers } from 'ethers'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useBlock from './useBlock'
import useNtfContract from './useNtfContract'
import useNtfMarketContract from './useNtfMarketContract'

const useSellHistories = (tokenId) => {
  const nftContract = useNtfContract()
  const nftMarketContract = useNtfMarketContract()
  const [list, setList] = useState([])
  const provider = window.providerEth
  const dispatch = useDispatch()
  const block = useBlock()

  useEffect(() => {
    ;(async () => {
      if (nftContract && nftMarketContract && provider) {
        const listItems = await nftMarketContract.fetchSellHistoryOfToken(tokenId)
        const data = await Promise.all(
          listItems.map(async (i) => {
            const timestamp = (await provider.getBlock(i.blockNumber.toNumber())).timestamp
            let item = {
              buyer: i.buyer,
              price: ethers.utils.formatUnits(i.price.toString(), 'ether'),
              timestamp,
              time: moment.unix(timestamp).fromNow(),
              itemMarketId: i.itemMarketId.toNumber(),
              transactionHash: i.transactionHash.toString()
            }
            return item
          }),
        )
        setList(data)
        return true
      }
    })()
  }, [dispatch, nftContract, nftMarketContract, provider, tokenId, block])
  return list
}

export default useSellHistories
