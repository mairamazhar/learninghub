import { useId, useMemo, useRef, useState } from 'react'
import './Combobox.css'

// Wraps the matched part of `text` in <mark>
function highlightMatch(text, query) {
  const q = query.trim()
  if (!q) return text
  const start = text.toLowerCase().indexOf(q.toLowerCase())
  if (start === -1) return text
  const end = start + q.length
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

/**
 * Combobox: a searchable dropdown with autocomplete.
 *
 * @param {object}   props
 * @param {string}   props.label        Visible label
 * @param {{value: string, label: string, count?: number, color?: string}[]} props.options
 * @param {string}   props.value        Currently selected option value
 * @param {Function} props.onChange     Called with the new value
 * @param {string}   [props.clearValue] Value the × button resets to (hidden when already selected)
 * @param {string}   [props.placeholder]
 * @param {string}   [props.emptyText]  Shown when nothing matches the search
 */
function Combobox({
  label,
  options,
  value,
  onChange,
  clearValue,
  placeholder = 'Search…',
  emptyText = 'No matches found',
}) {
  const id = useId()
  const listId = `${id}-listbox`
  const optionId = (index) => `${id}-option-${index}`
  const inputRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = options.find((o) => o.value === value)

  // Filter by the typed text; labels that START with it rank first
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options
      .filter((o) => o.label.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(b.label.toLowerCase().startsWith(q)) -
          Number(a.label.toLowerCase().startsWith(q)),
      )
  }, [options, query])

  const active = Math.min(activeIndex, filtered.length - 1)

  // Inline autocomplete: the rest of the best match, shown as ghost text
  const bestMatch = filtered[0]
  const completion =
    query && bestMatch?.label.toLowerCase().startsWith(query.toLowerCase())
      ? bestMatch.label.slice(query.length)
      : ''

  const open = () => {
    setIsOpen(true)
    // Start on the currently selected option
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)))
  }

  const close = () => {
    setIsOpen(false)
    setQuery('')
  }

  const select = (option) => {
    if (!option) return
    onChange(option.value)
    close()
  }

  const moveActive = (step) => {
    if (!isOpen) return open()
    if (filtered.length === 0) return
    const next = (active + step + filtered.length) % filtered.length
    setActiveIndex(next)
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' })
  }

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveActive(-1)
        break
      case 'Enter':
        if (isOpen) {
          e.preventDefault()
          select(filtered[active])
        }
        break
      case 'ArrowRight': {
        // Accept the ghost-text suggestion when the cursor is at the end
        const atEnd = e.currentTarget.selectionStart === query.length
        if (completion && atEnd) {
          e.preventDefault()
          select(bestMatch)
        }
        break
      }
      case 'Tab':
        // Accept the highlighted option, then let focus move on normally
        if (isOpen && query) select(filtered[active])
        break
      case 'Escape':
        if (isOpen) {
          e.preventDefault()
          close()
        }
        break
      default:
        break
    }
  }

  const showClear = clearValue !== undefined && value !== clearValue

  return (
    <div className={`combobox ${isOpen ? 'is-open' : ''}`}>
      <label className="combobox__label" htmlFor={`${id}-input`}>
        {label}
      </label>

      <div className="combobox__control">
        {selected?.color && !query && (
          <span
            className="combobox__dot"
            style={{ background: selected.color }}
            aria-hidden="true"
          />
        )}

        <div className="combobox__field">
          {/* Ghost text sits behind the input, aligned with the typed text */}
          <span className="combobox__ghost" aria-hidden="true">
            <span className="combobox__ghost-typed">{query}</span>
            {completion}
          </span>
          <input
            ref={inputRef}
            id={`${id}-input`}
            className="combobox__input"
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="both"
            aria-activedescendant={isOpen && filtered.length ? optionId(active) : undefined}
            placeholder={isOpen ? (selected?.label ?? placeholder) : placeholder}
            value={isOpen ? query : (selected?.label ?? '')}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
              setIsOpen(true)
            }}
            onFocus={open}
            onClick={() => !isOpen && open()}
            onBlur={close}
            onKeyDown={handleKeyDown}
          />
        </div>

        {showClear && (
          <button
            type="button"
            className="combobox__icon-btn"
            aria-label={`Clear ${label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(clearValue)
              close()
            }}
          >
            ×
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          className="combobox__icon-btn combobox__chevron"
          aria-label={isOpen ? 'Close options' : 'Open options'}
          onMouseDown={(e) => {
            // Keep focus in the input; toggle the list
            e.preventDefault()
            inputRef.current?.focus()
            if (isOpen) close()
            else open()
          }}
        >
          ▾
        </button>
      </div>

      {isOpen && (
        <ul id={listId} className="combobox__list" role="listbox" aria-label={label}>
          {filtered.length === 0 ? (
            <li className="combobox__empty" role="presentation">
              {emptyText}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={option.value === value}
                className={`combobox__option ${index === active ? 'is-active' : ''}`}
                // mousedown + preventDefault so the input doesn't blur before selecting
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option.color && (
                  <span
                    className="combobox__dot"
                    style={{ background: option.color }}
                    aria-hidden="true"
                  />
                )}
                <span className="combobox__option-label">
                  {highlightMatch(option.label, query)}
                </span>
                {option.count !== undefined && (
                  <span className="combobox__count">{option.count}</span>
                )}
                {option.value === value && (
                  <span className="combobox__check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default Combobox
