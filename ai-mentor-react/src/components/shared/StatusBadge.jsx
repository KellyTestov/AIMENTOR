export default function StatusBadge({ status }) {
  const isPublished = status === 'published'
  return (
    <span className={`card__status ${isPublished ? 'is-published' : 'is-private'}`}>
      {isPublished ? 'Опубликован' : 'Приватное'}
    </span>
  )
}
