import { Select } from '@alfalab/core-components/select/esm'

/**
 * Мульти-чекбокс дропдаун для фильтрации
 * value: 'all' | string | string[]
 */
export default function FilterDropdown({ label, options, value, onChange }) {
  const selected = value === 'all' ? [] : Array.isArray(value) ? value : [value]

  const selectOptions = options.map((opt) => ({ key: opt, content: opt }))
  const selectedOptions = selected.map((v) => ({ key: v, content: v }))

  function handleChange({ selectedMultiple }) {
    const keys = (selectedMultiple || []).map((o) => o.key)
    onChange(keys.length === 0 ? 'all' : keys)
  }

  return (
    <Select
      label={label}
      options={selectOptions}
      selected={selectedOptions}
      onChange={handleChange}
      multiple
      size={40}
      optionsListWidth="content"
    />
  )
}
