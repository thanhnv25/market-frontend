import { Box, InputLabel, MenuItem } from '@mui/material'
import styled from '@emotion/styled'
import { CssTextField, StyledFormControl, StyledSelect } from '../Create'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import RentalCard from '../../components/RentalCard'
import RentalCardModal from '../../components/RentalCardModal'
import useListLend from '../../hooks/useListLend'
import useListMyLend from '../../hooks/useListMyLend'
import useListBorrow from '../../hooks/useListBorrow'
import { ClassItem, ITEMS_PER_PAGE } from '../../constants'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import useBlock from '../../hooks/useBlock'
import Pagination from '@mui/material/Pagination'

const Container = styled(Box)`
  width: calc(100% - 16px);
`

const RowControl = styled(Box)`
  margin-top: 32px;

  > * + * {
    margin-left: 16px !important;
  }
`

const RowGridWrapper = styled(Box)`
  margin-top: 32px;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: auto;
  flex: 1;
`

const RowGrid = styled(Box)`
  width: 1080px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  place-items: center;
  row-gap: 45px;
`

const PagingContainer = styled(Box)`
  margin-top: 80px;
  display: flex;
  justify-content: center;
`

export default function Marketplace() {
  const itemsPerPage = ITEMS_PER_PAGE
  const { t } = useTranslation()
  const chainId = useSelector((state) => state.provider.chainId)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Lowest price')
  const [filterByOrderType, setFilterByOrderType] = useState('All')
  const [filterByClassify, setFilterByClassify] = useState('All')
  const [listDataLength, setListDataLength] = useState([])
  const account = useSelector((state) => state.provider.account)

  const [openModal, setOpenModal] = useState(false)
  const [itemModal, setItemModal] = useState({})
  const block = useBlock()
  const listLend = useListLend(block)
  const listBorrow = useListBorrow(account)
  const listMyLend = useListMyLend(account)
  const [pageCount, setPageCount] = useState(0)
  const [itemOffset, setItemOffset] = useState(0)
  const [currentItems, setCurrentItems] = useState([])
  useEffect(() => {
    let result
    switch (filterByOrderType) {
      case 'Rental list':
        result = listLend
        break
      case 'My rental list':
        result = listMyLend
        break
      case 'My borrow list':
        result = listBorrow
        break
      default:
        result = listLend
        break
    }
    if (filterByClassify !== 'All') {
      result = _.filter(result, (item) => item.class === filterByClassify)
    }
    if (search) {
      result = _.filter(result, (item) => item.tokenId.toString() === search)
    }
    switch (sortBy) {
      case 'Lowest price':
        result = _.orderBy(result, ['price'], ['asc'])
        break
      case 'Highest price':
        result = _.orderBy(result, ['price'], ['desc'])
        break
      case 'Lowest ID':
        result = _.orderBy(result, ['id'], ['asc'])
        break
      case 'Highest ID':
        result = _.orderBy(result, ['id'], ['desc'])
        break
      default:
        break
    }
    setListDataLength(result.length)
    const endOffset = itemOffset + itemsPerPage
    setPageCount(Math.ceil(result.length / itemsPerPage))
    setCurrentItems(result.slice(itemOffset, endOffset))
  }, [
    listMyLend,
    account,
    chainId,
    filterByClassify,
    filterByOrderType,
    listLend,
    listBorrow,
    search,
    sortBy,
    itemOffset,
    itemsPerPage,
  ])

  const onCloseModal = () => {
    setOpenModal(false)
  }

  // Invoke when user click to request another page.
  const handlePageClick = (newPage) => {
    const newOffset = ((newPage - 1) * itemsPerPage) % listDataLength
    setItemOffset(newOffset)
  }

  return (
    <Container>
      <RentalCardModal open={openModal} onClose={onCloseModal} itemModal={itemModal} />
      <RowControl display="flex" justifyContent="center">
        <CssTextField
          width="15vw"
          label={t('Search...')}
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <StyledFormControl width="160px" value={sortBy}>
          <InputLabel style={{ color: '#decbbd' }} size="small">
            {t('Sort by')}
          </InputLabel>
          <StyledSelect
            displayEmpty
            label={t('Sort by')}
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="Lowest price">{t('Lowest price')}</MenuItem>
            <MenuItem value="Highest price">{t('Highest price')}</MenuItem>
            <MenuItem value="Lowest ID">{t('Lowest ID')}</MenuItem>
            <MenuItem value="Highest ID">{t('Highest ID')}</MenuItem>
          </StyledSelect>
        </StyledFormControl>
        <StyledFormControl width="120px" value={filterByOrderType}>
          <InputLabel style={{ color: '#decbbd' }} size="small">
            {t('Type')}
          </InputLabel>
          <StyledSelect
            displayEmpty
            label={t('Type')}
            size="small"
            defaultValue="Rental list"
            onChange={(e) => setFilterByOrderType(e.target.value)}
          >
            <MenuItem value="Rental list">{t('Rental list')}</MenuItem>
            <MenuItem value="My rental list">{t('My rental list')}</MenuItem>
            <MenuItem value="My borrow list">{t('My borrow list')}</MenuItem>
          </StyledSelect>
        </StyledFormControl>
        <StyledFormControl width="120px" value={filterByClassify}>
          <InputLabel style={{ color: '#decbbd' }} size="small">
            {t('Class')}
          </InputLabel>
          <StyledSelect
            displayEmpty
            label={t('Class')}
            size="small"
            defaultValue="All"
            onChange={(e) => setFilterByClassify(e.target.value)}
          >
            <MenuItem value="All">{t('All')}</MenuItem>
            {Object.keys(ClassItem).map((item, index) => {
              return (
                <MenuItem value={ClassItem[item]} style={{ textTransform: 'capitalize' }} key={index}>
                  {t(item.toLocaleLowerCase())}
                </MenuItem>
              )
            })}
          </StyledSelect>
        </StyledFormControl>
      </RowControl>
      <RowGridWrapper style={{ overflow: 'visible' }}>
        <RowGrid>
          {currentItems.map((item, index) => {
            return (
              <RentalCard
                onClick={() => {
                  setItemModal(item)
                  setOpenModal(true)
                }}
                onClose={onCloseModal}
                item={item}
                key={index}
              />
            )
          })}
        </RowGrid>
      </RowGridWrapper>
      <PagingContainer>
        <Pagination
          count={pageCount}
          showFirstButton
          showLastButton
          color="primary"
          style={{ display: pageCount ? 'block' : 'none' }}
          onChange={(_, value) => {
            handlePageClick(value)
          }}
        />
      </PagingContainer>
    </Container>
  )
}
