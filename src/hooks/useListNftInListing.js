import axios from 'axios'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBlock from './useBlock'
import moment from 'moment'


const useListNftInListing = () => {
  const [list, setList] = useState([])
  const [timestamp, setTimestamp] = useState([])
  const block = useBlock()

  const socket = window.socket

  useEffect(() => {
    if (socket) {
      socket.on('NeedUpdateData', (timestamp) => {
        console.log('socket::>>', timestamp)
        setTimestamp(timestamp)
      })
    }
  }, [socket])

  const fetchData = useCallback(async () => {
    const blockMax = Number.MAX_SAFE_INTEGER
    const availableItem = await axios.get(`${process.env.REACT_APP_API_URL}/nft-market/items/${blockMax}`)
    // get list tokens
    const listItems = await availableItem.data
    console.log('listItems::>>', listItems)
    const data = await Promise.all(
      listItems.itemMarket.map(async (i) => {
        let minPrice = ethers.utils.formatUnits(i.minPrice.toString(), 'ether')
        let price = ethers.utils.formatUnits(i.maxPrice.toString(), 'ether')
        let currentPrice = ethers.utils.formatUnits(i.currentPrice.toString(), 'ether')
        let blockEnd = i.endBlock
        let remainBlock = blockEnd - block
        const sellHistories = await Promise.all(
          i.nft.sellHistories.map(async (history) => {
            const createTime = new Date(history.createdAt);
            const timestamp = createTime.getTime()/1000
            console.log("create-at: ", timestamp)
            let item = {
              buyer: history.buyer,
              price: ethers.utils.formatUnits(history.price.toString(), 'ether'),
              timestamp,
              time: moment.unix(timestamp).fromNow(),
              itemMarketId: history.itemMarketId
            }
            return item
          } )
        )
        let item = {
          id: i.itemId.toString(),
          minPrice,
          price,
          currentPrice,
          tokenId: i.tokenId,
          seller: i.seller,
          buyer: i.buyer,
          image: i.nft.img,
          class: i.nft.class,
          level: i.nft.level.toString(),
          heath: i.nft.heath.toString(),
          morale: i.nft.morale.toString(),
          skill: i.nft.skill.toString(),
          speed: i.nft.speed.toString(),
          remainBlock,
          endBlock: blockEnd,
          sellHistories: sellHistories,
          offers: i.offers,
        }
        return item
      }),
    )
    return data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    ;(async () => {
      const data = await fetchData()
      setList(data)
      return true
    })()
  }, [fetchData, timestamp])
  return list
}

export default useListNftInListing
