import { Select } from '@alfalab/core-components/select/esm'

/**
 * Мульти-фильтр с компактным отображением выбранных значений
 * value: 'all' | string | string[]
 */
export default function FilterDropdown({ label, options, value, onChange }) {
  const selected = value === 'all' ? [] : Array.isArray(value) ? value : [value]

  const selectOptions = options.map((opt) => ({ key: opt, content: opt }))
  const selectedOptions = selected.map((v) => ({ key: v, content: v }))

  function handleChange({ selectedMultiple }) {
    const keys = [...new Set((selectedMultiple || []).map((o) => o.key))]
    onChange(keys.length === 0 ? 'all' : keys)
  }

  function valueRenderer({ selectedMultiple }) {
    if (!selectedMultiple || selectedMultiple.length === 0) return null
    if (selectedMultiple.length === 1) return selectedMultiple[0].content
    return `${selectedMultiple[0].content} +${selectedMultiple.length - 1}`
  }

  return (
    <Select
      label={label}
      options={selectOptions}
      selected={selectedOptions}
      onChange={handleChange}
      valueRenderer={valueRenderer}
      multiple
      size={40}
      optionsListWidth="content"
    />
  )
}
