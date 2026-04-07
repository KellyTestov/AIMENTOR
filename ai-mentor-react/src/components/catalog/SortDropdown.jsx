import { Select } from '@alfalab/core-components/select/esm'

const SORT_OPTIONS = [
  { key: 'updated_desc', content: 'Сначала новые изменения' },
  { key: 'created_desc', content: 'Сначала новые создания' },
  { key: 'name_asc',     content: 'По алфавиту А-Я' },
]

export default function SortDropdown({ value, onChange }) {
  return (
    <Select
      label="Сортировка"
      options={SORT_OPTIONS}
      selected={value ? { key: value, content: SORT_OPTIONS.find((o) => o.key === value)?.content || value } : null}
      onChange={({ selected }) => selected && onChange(selected.key)}
      size={40}
      optionsListWidth="content"
    />
  )
}
