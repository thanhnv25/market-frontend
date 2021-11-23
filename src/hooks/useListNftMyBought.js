import { useEffect, useState } from 'react'
import useNtfContract from './useNtfContract'
import useNtfMarketContract from './useNtfMarketContract'
import axios from 'axios'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { ethers } from 'ethers'
const useListNftMyBought = () => {
  const nftContract = useNtfContract()
  const nftMarketContract = useNtfMarketContract()
  const [list, setList] = useState([])
  const account = useSelector((state) => state.provider.account)
  const metaData = useSelector((state) => state.tokenData.metaData)
  const [timestamp, setTimestamp] = useState([])
  const socket = window.socket

  useEffect(() => {
    if (socket) {
      socket.on('NeedUpdateData', (timestamp) => {
        console.log('socket::>>', timestamp)
        setTimestamp(timestamp)
      })
    }
  }, [socket])

  const fetchUserNft = async () => {
    const markets = await axios.get(`${process.env.REACT_APP_API_URL}/nfts/user/${account}`)
    console.log('markets::>>', markets)
    const data = markets.data.nfts.map(marketItem => {
      const sellHistories = marketItem.sellHistories.map(history => {
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
        sellHistories: sellHistories,
      }
      return item
    })
    setList(data)
  }
  useEffect(() => {
    ;(async () => {
      if (nftContract && nftMarketContract && account) {
        await fetchUserNft()
        return true
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, nftContract, nftMarketContract, timestamp])
  return list
}

export default useListNftMyBought
