import { App, Btn, Card, D, H1, Input } from 'b44ui'
import { useState } from 'react'

export default () => {
  const [ix, setIx] = useState(0), [em, setEm] = useState('')
  const sub = () => fetch('https://boratto.ca/hit/bksignup?em='+em).then(x => setIx(2))

  return <App align='center'>
    <H1>botblocks</H1>
    is a platform that makes it incredibly easy to build robots.

    <Card wd={0.6}> <video controls src='bk.mp4' /> </Card>

    {ix == 0 && <Btn click={() => setIx(1)}>learrn more</Btn>}
    {ix == 1 && <D row gap={4}>
      <Input state={[em, setEm]} placeholder='email..' /> <Btn click={sub}>subscribe</Btn>
    </D> }
    {ix == 2 && <D>{`you'll get emails for new announcements!`}</D>}
  </App>
}
