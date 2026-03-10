import { useEffect, useRef, useState } from 'react'
import { App, Btn, Card, Code, Col, D, Grid, Md, Muted, Popover, Row } from 'b44ui'
import { loadPyodide } from 'pyodide'
import { setupPyodideFiles } from 'virtual:pyodide-files'
import Editor from './Editor'
import SimView from './SimView'
import { Sim } from './sim'

let raf: number | null = null
function stopLoop() {
  if (raf !== null) window.cancelAnimationFrame(raf)
  raf = null
}

export default () => {
  const [code, setCode] = useState<string | null>()
  const [err, setErr] = useState<string[]>([])
  const simRef = useRef<Sim | null>(null)
  const restartRef = useRef<() => void>(() => { })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { fetch('demo.py').then(r => r.text()).then(setCode) }, [])
  useEffect(() => () => stopLoop(), [])
  useEffect(() => {
    if (!simRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => restartRef.current(), 1000)
  }, [code])

  const pushErr = (stage: string, err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[demo] python error during ${stage}`, err)
    setErr(prev => [...prev, msg])
  }

  const restart = async () => {
    if (!simRef.current || !code) return
    setErr([])
    stopLoop()
    simRef.current.reset()
    simRef.current.start()

    let pyodide: Awaited<ReturnType<typeof loadPyodide>>
    try {
      pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/npm/pyodide@0.29.3/' })
      await setupPyodideFiles(pyodide)
      await pyodide.runPythonAsync("import sys\nif './public' not in sys.path:\n    sys.path.insert(0, './public')")
      pyodide.registerJsModule('_bridge', simRef.current)
      await pyodide.runPythonAsync(code)
    } catch (err) {
      pushErr('boot', err)
      stopLoop()
      return
    }

    const frame = async () => {
      try {
        await pyodide.runPythonAsync('loop()')
      } catch (err) {
        pushErr('loop()', err)
        stopLoop()
        return
      }
      raf = window.requestAnimationFrame(frame)
    }
    frame()
  }
  restartRef.current = restart
  return <App width={1000}>
    <Row> <D cn='text-3xl font-bold'> botblocks</D> <Muted cn='text-md'>is a very nice robotics platform</Muted> </Row>

    <Grid cols={2} gap={4}>
      <Card p={0} gap={0}>
        <Row p={2}> <Muted grow>bot.py</Muted> <Btn click={restart} sm color="purple">restart</Btn> </Row>
        {code != null && <Editor value={code} onChange={setCode} />}
      </Card>

      <Card p={0} gap={0}>
        <Row p={2}>
          <Muted grow>simulator</Muted>
          {err.length > 0 && <Popover p={0} text={err.map(e=><Code>{e}</Code>)}>
              <Btn sm color='red'>error</Btn>
          </Popover>}
        </Row>
        <SimView simRef={simRef} />
      </Card>
    </Grid>

    <Md># overview</Md>
    <Grid cols={2}> {/* todo add api overview */}
      <Col gap={0}> <b>bk.SimWorld(objects)</b> the simulator. takes in objects, or use SimWorld.add(object)</Col>
      <Col gap={0}> <b>bk.SimRobot(template)</b> define an extensible robot, optionally from a template. </Col>
      <Col gap={0}> <b>bk.Motor(robot, name)</b> basic motor block.</Col>
      <Col gap={0}> <b>bk.Camera(robot)</b> basic camera block.</Col>
      <Col gap={0}> <b>bk.cv.YOLO(frame)</b> YOLO is an object detection model, one of many supported.</Col>
      <Col gap={0}> <b>bk.Burger(x, y)</b> place a burger somewhere for testing, random by default.</Col>
    </Grid>
  </App>
}
