export const toRoutePath = (year, month, day, title) => {
  return `/posts` +  (title ? `/${year}/${month}/${day}/${title}` : (day ? `/${year}/${month}/${day}` : (month ? `/${year}/${month}`: (year ? `/${year}` : '/'))))
}