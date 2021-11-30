import { useEffect, useState,useCallback } from 'react'
import useNtfContract from './useNtfContract'
import useNtfMarketContract from './useNtfMarketContract'
import axios from 'axios'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { ethers } from 'ethers'

const useListNftMyBought = (address) => {
  const nftContract = useNtfContract()
  const nftMarketContract = useNtfMarketContract()
  const [list, setList] = useState([])
  const account = useSelector((state) => state.provider.account)
  const [timestamp, setTimestamp] = useState([])
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

  const fetchUserNft = useCallback(async (account) => {
    const markets = await axios.get(`${process.env.REACT_APP_API_URL}/nfts/user/${account}`)
    const data = markets.data.nfts.map((marketItem) => {
      const sellHistories = marketItem.sellHistories.map((history) => {
        const createTime = new Date(history.createdAt)
        const timestamp = createTime.getTime() / 1000
        let item = {
          buyer: history.buyer.toString(),
          price: ethers.utils.formatUnits(history.price.toString(), 'ether'),
          timestamp,
          time: moment.unix(timestamp).fromNow(),
          itemMarketId: history.itemMarketId,
          transactionHash: history.transactionHash.toString(),
        }
        return item
      })

      let item = {
        tokenId: marketItem.tokenId,
        image: marketItem.img,
        class: marketItem.class,
        level: marketItem.level.toString(),
        heath: marketItem.heath.toString(),
        morale: marketItem.morale.toString(),
        skill: marketItem.skill.toString(),
        speed: marketItem.speed.toString(),
        buyer: marketItem.buyer ? marketItem.buyer : '',
        owner: marketItem.owner.toString(),
        sellHistories: sellHistories,
        lock: marketItem.lock
      }
      return item
    })
    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    ; (async () => {
      if (nftContract && nftMarketContract && account) {
        const data = await fetchUserNft(address)
        setList(data)
        return true
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserNft, account, nftContract, nftMarketContract, timestamp])
  return list
}

export default useListNftMyBought
