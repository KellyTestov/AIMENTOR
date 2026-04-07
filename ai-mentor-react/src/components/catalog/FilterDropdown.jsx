import { SelectWithTags } from '@alfalab/core-components/select-with-tags/esm'

// SelectWithTags internal defaultMatch uses option.value, but OptionShape uses option.key
const matchByKey = (option, inputValue) =>
  (option.key || '').toLowerCase().includes((inputValue || '').toLowerCase())

/**
 * Мульти-фильтр с тегами, скрывающимися при переполнении
 * value: 'all' | string | string[]
 */
export default function FilterDropdown({ label, options, value, onChange }) {
  const selected = value === 'all' ? [] : Array.isArray(value) ? value : [value]

  const selectOptions = options.map((opt) => ({ key: opt, content: opt }))
  const selectedOptions = selected.map((v) => ({ key: v, content: v }))

  function handleChange({ selectedMultiple }) {
    const keys = [...new Set((selectedMultiple || []).map((o) => (typeof o === 'string' ? o : o.key)))]
    onChange(keys.length === 0 ? 'all' : keys)
  }

  return (
    <SelectWithTags
      label={label}
      options={selectOptions}
      selected={selectedOptions}
      onChange={handleChange}
      match={matchByKey}
      collapseTagList
      size={40}
      optionsListWidth="content"
    />
  )
}
