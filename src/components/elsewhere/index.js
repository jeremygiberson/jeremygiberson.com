export const Elsewhere = ({bullets = false}) => {
  return (
    <ul className={`icon-list ${bullets ? '': 'list-unstyled'}`}>
      <li><a target={'_blank'} href={"https://github.com/jeremygiberson"}>GitHub Profile</a></li>
      <li><a target={'_blank'} href={"https://www.linkedin.com/in/jeremy-giberson-a10ab832/"}>LinkedIn Profile</a></li>
      <li><a target={'_blank'} href={"https://www.codewars.com/users/jeremygiberson"}>Codewars Profile</a></li>
      <li><a target={'_blank'} href={"https://stackoverflow.com/users/813486/jeremy-giberson"}>StackOverflow Profile</a></li>
    </ul>
  )
}