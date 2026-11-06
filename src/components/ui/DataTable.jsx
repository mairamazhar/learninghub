import { useMemo, useState } from 'react'
import './DataTable.css'

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Sortable, paginated table.
 *
 * @param {Array<{key:string,label:string,sortable?:boolean,numeric?:boolean,render?:Function}>} columns
 * @param {object[]} rows
 * @param {string}   rowKey                 Field that uniquely identifies a row
 * @param {number[]} [pageSizes]
 * @param {{key:string,dir:'asc'|'desc'}} [initialSort]
 */
function DataTable({ columns, rows, rowKey, caption, pageSizes = [5, 10, 25], initialSort = null }) {
  const [sort, setSort] = useState(initialSort)
  const [pageSize, setPageSize] = useState(pageSizes[0])
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === 'asc' ? 1 : -1
    return rows.toSorted((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      return (typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y))) * factor
    })
  }, [rows, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  const visible = sorted.slice(start, start + pageSize)

  // Cycle: ascending -> descending -> back to ascending (always keeps a defined order)
  const toggleSort = (key) => {
    setSort((s) => (s?.key === key && s.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }))
    setPage(1)
  }

  return (
    <div className="dt">
      <div className="dt__scroll">
        <table className="table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key
                const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined
                return (
                  <th key={col.key} scope="col" aria-sort={ariaSort} className={col.numeric ? 'is-num' : undefined}>
                    {col.sortable ? (
                      <button type="button" className={`dt__sort ${active ? 'is-active' : ''}`} onClick={() => toggleSort(col.key)}>
                        {col.label}
                        <span className="dt__arrow" aria-hidden="true">{active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((col) => (
                  <td key={col.key} className={col.numeric ? 'is-num' : undefined}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={columns.length} className="dt__empty">No results.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dt__footer">
        <p aria-live="polite">
          {sorted.length === 0 ? '0 results' : `Showing ${start + 1}–${Math.min(start + pageSize, sorted.length)} of ${sorted.length}`}
        </p>

        <label className="dt__size">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
          >
            {pageSizes.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <nav className="dt__pager" aria-label="Pagination">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">‹</button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === current ? 'is-active' : ''}
              aria-current={n === current ? 'page' : undefined}
              aria-label={`Page ${n}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pageCount} aria-label="Next page">›</button>
        </nav>
      </div>
    </div>
  )
}

export default DataTable
