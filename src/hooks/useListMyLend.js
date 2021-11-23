import axios from 'axios'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBlock from './useBlock'
import moment from 'moment'

const useListMyLend = (address) => {
    const [list, setList] = useState([])
    const [timestamp, setTimestamp] = useState([])
    const socket = window.socket
    const block = useBlock()

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

    const fetchData = useCallback(async (account,currenBlock) => {
        const availableItem = await axios.get(`${process.env.REACT_APP_API_URL}/lend-items/my-lend/${account}`)
        console.log(`${process.env.REACT_APP_API_URL}/lend-items/my-lend/${account}`);
        const listItems = await availableItem.data
        console.log(listItems);
        const data = await Promise.all(
            listItems.lendItems.map(async (i) => {
                let blockEnd = i.lendBlockDuration
                let remainBlock = blockEnd - currenBlock
                const lendHistories = await Promise.all(
                    i.nft.lendHistories.map(async (history) => {

                        const createTime = new Date(history.createdAt);
                        const timestamp = createTime.getTime() / 1000
                        let item = {
                            borrower: history.borrower,
                            price: ethers.utils.formatUnits(history.priceLend.toString(), 'ether'),
                            timestamp,
                            time: moment.unix(timestamp).fromNow(),
                            itemId: history.itemId
                        }
                        return item
                    })
                )
                let item = {
                    id: i.itemId.toString(),
                    tokenId: i.tokenId,
                    lender: i.lender,
                    borrower: i.borrower,
                    price: ethers.utils.formatUnits(i.priceLend.toString(), 'ether'),
                    lent: i.lent,
                    paid: i.paid,
                    isCanceled: i.isCanceled,
                    lendBlockDuration: i.lendBlockDuration,
                    remainBlock,
                    image: i.nft.img,
                    class: i.nft.class,
                    level: i.nft.level.toString(),
                    heath: i.nft.heath.toString(),
                    morale: i.nft.morale.toString(),
                    skill: i.nft.skill.toString(),
                    speed: i.nft.speed.toString(),
                    lendHistories
                }
                return item
            }),
        )
        return data
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        ; (async () => {
            const data = await fetchData(address, block)
            setList(data)
            return true
        })()
    }, [fetchData, timestamp, address, block])
    return list
}

export default useListMyLend
