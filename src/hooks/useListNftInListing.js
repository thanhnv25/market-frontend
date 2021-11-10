import axios from 'axios'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMetadata } from '../states/tokenDataSlice'
import useBlock from './useBlock'
import useNtfContract from './useNtfContract'
import useNtfMarketContract from './useNtfMarketContract'

const useListNftInListing = () => {
  const nftContract = useNtfContract()
  const nftMarketContract = useNtfMarketContract()
  const [list, setList] = useState([])
  const dispatch = useDispatch()
  const block = useBlock()
  const metaData = useSelector((state) => state.tokenData.metaData)

  useEffect(() => {
    ;(async () => {
      if (nftContract && nftMarketContract) {
        // get list tokens
        const listItems = await nftMarketContract.fetchMarketItems()

        const data = await Promise.all(
          listItems.map(async (i) => {
            let meta
            if (!metaData[i.tokenId]) {
              const tokenUri = await nftContract.tokenURI(i.tokenId)
              meta = (await axios.get(tokenUri)).data
              dispatch(fetchMetadata({ meta: meta, id: i.tokenId }))
            }else{
              meta = metaData[i.tokenId]
            }
            const tokenState = await nftContract.tokenDetail(i.tokenId)
            let price = ethers.utils.formatUnits(i.minPrice.toString(), 'ether')
            let item = {
              id: i.itemId.toString(),
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              buyer: i.buyer,
              image: meta.urlImage,
              class: meta.classId,
              level: tokenState.level.toString(),
              heath: tokenState.heath.toString(),
              morale: tokenState.morale.toString(),
              skill: tokenState.skill.toString(),
              speed: tokenState.speed.toString(),
            }
            return item
          }),
        )
        setList(data)
        return true
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, nftContract, nftMarketContract, block])
  return list
}

export default useListNftInListing