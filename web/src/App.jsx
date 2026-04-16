import { App, Btn, Card, D, H1, Input } from 'b44ui'
import { useState } from 'react'

export default () => {
  const [ix, setIx] = useState(0)
  const [em, setEm] = useState('')

  const reg = () => {
    fetch('https://boratto.ca/botblocks/signup?email=' + em)
      .then(x => setIx(2))
  }

  return <App align='center'>
    <H1>botblocks</H1>
    is a platform that makes it incredibly easy to build robots.

    <Card wd={0.6}> <video controls src='bk.mov' /> </Card>

    {ix == 0 && <Btn click={() => setIx(1)}>learrn more</Btn>}
    {ix == 1 && <D row gap={4}>
      <Input state={[em, setEm]} placeholder='email...' /> <Btn click={reg}>subscribe</Btn>
    </D> }
    {ix == 2 && <D>{`you'll get emails for new announcements!`}</D>}

  </App>
}