import Web3Modal from 'web3modal'
import { SECOND_PER_BLOCK } from '../constants'
import { EXPLORER_TX,BLOCK_COUNT_DOWN } from '../constants/index'

export const saveTxPending = (tx, message) => {
  const txsStorage = JSON.parse(localStorage.getItem('tx_pending') ?? '{}') ?? {}
  txsStorage[tx] = message
  localStorage.setItem('tx_pending', JSON.stringify(txsStorage))
}

export const getTxPending = () => {
  return JSON.parse(localStorage.getItem('tx_pending') ?? '{}') ?? {}
}

export const removeTxSuccess = (tx) => {
  const txsStorage = JSON.parse(localStorage.getItem('tx_pending') ?? '{}') ?? {}
  if (txsStorage.hasOwnProperty(tx)) {
    delete txsStorage[tx]
  }
  localStorage.setItem('tx_pending', JSON.stringify(txsStorage))
}

export const connectWallet = async () => {
  const web3Modal = new Web3Modal()
  await web3Modal.connect()
}

export const timeToBlockNumber =  (time, chainId) => {
    let pickTime = new Date(time).getTime()
    let currentTimeStamp = Date.now()
    let blockNumber = Math.floor((pickTime - currentTimeStamp) / 1000 / SECOND_PER_BLOCK[chainId])
    
    return blockNumber
    // setBlockNumber(blockNumber)
}
export const getTxSuccess = () => {
  return JSON.parse(localStorage.getItem('tx_success') ?? '{}') ?? {}
}
export const saveTxSuccess = (tx, itemMarketId) => {
  const txsStorage = JSON.parse(localStorage.getItem('tx_success') ?? '{}') ?? {}
  if (txsStorage.hasOwnProperty(itemMarketId)) {
    return;
  }
  txsStorage[itemMarketId] = tx;
  localStorage.setItem('tx_success', JSON.stringify(txsStorage))
}
export const copyBuyer = (buyer) => {
  navigator.clipboard.writeText(buyer);
}

export const inforTx = (chainId, id) => {
  if (getTxSuccess()[id] === undefined) {
    return
  }
  window.open(EXPLORER_TX[chainId] + getTxSuccess()[id]);
}
export const blockRemains = (chainId,blockEnd)=>{
  window.open(BLOCK_COUNT_DOWN[chainId]+blockEnd);
}

