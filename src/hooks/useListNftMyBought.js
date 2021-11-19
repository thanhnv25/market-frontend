import { useEffect, useState } from 'react'
import useNtfContract from './useNtfContract'
import useNtfMarketContract from './useNtfMarketContract'
import axios from 'axios'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import useBlock from './useBlock'
import { fetchMetadata } from '../states/tokenDataSlice'
import { jsx } from '@emotion/react'

const useListNftMyBought = () => {
  const nftContract = useNtfContract()
  const nftMarketContract = useNtfMarketContract()
  const [list, setList] = useState([])
  const account = useSelector((state) => state.provider.account)
  const block = useBlock()
  const dispatch = useDispatch()
  const metaData = useSelector((state) => state.tokenData.metaData)
  const fetchUserNft = async() => {
    const markets = await axios.get(`${process.env.REACT_APP_API_URL}/nfts/user/${account}`)
    console.log('markets::>>', markets)
     const data = markets.data.nfts.map(marketItem => {
      let item = {
        tokenId: marketItem.tokenId,
        image: marketItem.img,
        class: marketItem.class,
        level: marketItem.level.toString(),
        heath: marketItem.heath.toString(),
        morale: marketItem.morale.toString(),
        skill: marketItem.skill.toString(),
        speed: marketItem.speed.toString(),
        buyer: marketItem.buyer? marketItem.buyer : ''
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
  }, [account, nftContract, nftMarketContract, block, dispatch])
  return list
}

export default useListNftMyBought
