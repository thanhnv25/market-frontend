import axios from 'axios'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBlock from './useBlock'
import moment from 'moment'

const useListLend = (bound) => {
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

    const fetchData = useCallback(async (boundBlock) => {
        if (boundBlock === undefined) {
            boundBlock = Number.MAX_SAFE_INTEGER
        }
        const availableItem = await axios.get(`${process.env.REACT_APP_API_URL}/lend-items/avail-lend/${boundBlock}`)
        // get list lend
        const listItems = await availableItem.data
        const data = await Promise.all(
            listItems.lendItems.map(async (i) => {
                let blockEnd = i.lendBlockDuration
                let remainBlock = blockEnd - await block
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
            const data = await fetchData(bound)
            setList(data)
            return true
        })()
    }, [fetchData, timestamp, bound])
    return list
}

export default useListLend
