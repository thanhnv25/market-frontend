import axios from 'axios'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useBlock from './useBlock'

const useListNftInListing = () => {
  const [list, setList] = useState([])
  const dispatch = useDispatch()
  const block = useBlock()

  const fetchData = async () => {
    const blockMax = Number.MAX_SAFE_INTEGER
    console.log(blockMax-block)
    const availableItem = await axios.get(`${process.env.REACT_APP_API_URL}/nft-market/items/9007199254740991`)
    // console.log('markets::>>', availableItem)
    // get list tokens
    const listItems = await availableItem.data
    console.log("list: ", listItems)
    const data = await Promise.all(
      listItems.itemMarket.map(async (i) => {
        let minPrice = ethers.utils.formatUnits(i.minPrice.toString(), 'ether')
        let price = ethers.utils.formatUnits(i.maxPrice.toString(), 'ether')
        let currentPrice = ethers.utils.formatUnits(i.currentPrice.toString(), 'ether')
        let blockEnd = i.endBlock
        let remainBlock = blockEnd - block
        console.log("blockend"+blockEnd, block)
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
          sellHistories: i.nft.sellHistories,
          offers: i.offers
        }
        return item
      }),
    )
    return data
  }
  useEffect(() => {
    ; (async () => {

      const data = await fetchData()
      setList(data)
      return true
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])
  return list
}

export default useListNftInListing
