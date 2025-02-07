import React, { useMemo, useRef, useState } from 'react'
import {
  Table,
  Loader,
  TextFilter,
  Dropdown,
  Pagination,
  NotMobile
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { OnSaleOrRentType, Props } from './OnSaleOrRentList.types'
import { SortBy } from '../../modules/routing/types'
import { useProcessedElements } from './utils'
import OnSaleListElement from './OnSaleListElement'
import OnRentListElement from './OnRentListElement'
import './OnSaleOrRentList.css'

const ROWS_PER_PAGE = 12

const OnSaleOrRentList = ({ elements, isLoading, onSaleOrRentType }: Props) => {
  const showRents = onSaleOrRentType === OnSaleOrRentType.RENT
  const perPage = useRef(ROWS_PER_PAGE)
  const sortOptions = useRef([
    { value: SortBy.NEWEST, text: t('filters.newest') },
    { value: SortBy.NAME, text: t('filters.name') }
  ])

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SortBy.NEWEST)
  const [page, setPage] = useState(1)

  const processedElements = useProcessedElements(
    elements,
    search,
    sort,
    page,
    perPage.current
  )

  const showPagination = processedElements.total / perPage.current > 1

  const searchNode = useMemo(
    () => (
      <TextFilter
        value={search}
        onChange={val => {
          setSearch(val)
          setPage(1)
        }}
        placeholder={t('on_sale_list.search', { count: elements.length })}
      />
    ),
    [elements.length, search]
  )

  return (
    <div className="onSaleOrRentTable">
      <div className="filters">
        <div className="search">{searchNode}</div>
        <Dropdown
          direction="left"
          value={sort}
          options={sortOptions.current}
          onChange={(_, data) => setSort(data.value as any)}
        />
      </div>
      {isLoading ? (
        <>
          <div className="overlay" />
          <Loader size="massive" active />
        </>
      ) : (
        <>
          <Table basic="very">
            <NotMobile>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <span>{t('global.item')}</span>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <span>{t('global.type')}</span>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <span>
                      {showRents ? t('global.status') : t('global.sale_type')}
                    </span>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <span>
                      {showRents
                        ? t('global.rent_price')
                        : t('global.sell_price')}
                    </span>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
            </NotMobile>
            <Table.Body>
              {processedElements.paginated.map(element =>
                showRents && element.nft && element.rental ? (
                  <OnRentListElement
                    key={`n-${element.nft.id}`}
                    nft={element.nft}
                    rental={element.rental}
                  />
                ) : (
                  <OnSaleListElement
                    key={
                      element.item
                        ? `i-${element.item.id}`
                        : `n-${element.nft!.id}`
                    }
                    {...element}
                  />
                )
              )}
            </Table.Body>
          </Table>
          {processedElements.total === 0 && (
            <div className="empty">{t('global.no_results')}</div>
          )}
          {showPagination && (
            <div className="pagination">
              <Pagination
                totalPages={Math.ceil(
                  processedElements.total / perPage.current
                )}
                activePage={page}
                onPageChange={(_, data) => setPage(Number(data.activePage))}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default React.memo(OnSaleOrRentList)
