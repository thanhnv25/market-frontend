import axios from 'axios'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBlock from './useBlock'
import moment from 'moment'
import { useSelector } from 'react-redux'
import _ from 'lodash'

const useListNftMyOffer = (address) => {
  const [list, setList] = useState([])
  const [timestamp, setTimestamp] = useState([])
  const block = useBlock()
  const socket = window.socket

  useEffect(() => {
    const onHandleSocket = (timestampFromEvent) => {
        console.log('socket::>>', timestampFromEvent)
        setTimestamp(timestampFromEvent)
    }
    if (socket) {
        socket.on('NeedUpdateData', onHandleSocket)
    }
    return () => socket && socket.off('NeedUpdateData')
  }, [socket])

  const fetchData = useCallback(async (account,currentBlock) => {
    const availableItem = await axios.get(`${process.env.REACT_APP_API_URL}/nft-market/my-offer/${account}`)
    // get list tokens
    const listItems = availableItem.data
    const data = listItems.itemMarkets.map((i) => {
      let minPrice = ethers.utils.formatUnits(i.minPrice.toString(), 'ether')
      let price = ethers.utils.formatUnits(i.maxPrice.toString(), 'ether')
      let currentPrice = ethers.utils.formatUnits(i.currentPrice.toString(), 'ether')
      let blockEnd = i.endBlock
      let remainBlock = blockEnd - currentBlock
      const sellHistories = i.nft.sellHistories.map((history) => {
        const createTime = new Date(history.createdAt)
        const timestamp = createTime.getTime() / 1000
        let item = {
          buyer: history.buyer,
          price: ethers.utils.formatUnits(history.price.toString(), 'ether'),
          timestamp,
          time: moment.unix(timestamp).fromNow(),
          itemMarketId: history.itemMarketId,
          transactionHash: history.transactionHash.toString(),
        }
        return item
      })
      const offers = i.offers.map((offer) => {
        let item = {
          asker: offer.asker,
          amount: ethers.utils.formatUnits(offer.amount.toString(), 'ether'),
          refundable: offer.refundable,
          blockTime: offer.blockTime,
        }
        return item
      })
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
        remainBlock: remainBlock,
        endBlock: blockEnd,
        sellHistories: sellHistories,
        offers: _.orderBy(offers, ['amount'], ['desc']),
      }
      return item
    })
    return data

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    ;(async () => {
      const data = await fetchData(address, block)
      setList(data)
      return true
    })()
  }, [fetchData, timestamp, block])
  return list
}

export default useListNftMyOffer
