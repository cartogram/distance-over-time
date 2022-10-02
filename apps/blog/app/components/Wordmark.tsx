import {useState, useEffect, useLayoutEffect, useRef} from 'react'
import {animated, useSpring, useTrail, config} from 'react-spring'
import {useInterval} from '~/hooks'
import shuffle from 'lodash/shuffle'
import {clsx} from 'clsx'
interface WordmarkProps {
  height: number
  width: number
  active?: boolean
}

function useGrid({
  height,
  width,
  rows,
  cols,
}: {
  height: number
  width: number
  rows: number
  cols: number
}) {
  const [coords, setCoords] = useState<[number, number][]>([])

  function getCoords() {
    const coords: [number, number][] = []
    const xh = width / rows
    const yh = height / cols

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        coords.push([Math.floor(x * xh), Math.floor(y * yh)])
      }
    }
    return coords
    // return shuffle(coords)
  }

  useEffect(() => {
    const coords = getCoords()
    setCoords(coords)
  }, [height, width])

  return {coords}
}

const nameArray = ['Distance', 'over', 'time']

export function Wordmark({height, width, active = true}: WordmarkProps) {
  const wh = Math.min(width / 2, height)

  const {coords} = useGrid({
    height: wh,
    width: wh,
    rows: 4,
    cols: 4,
  })

  return (
    <div style={{height: wh, width: wh}} className="Wordmark">
      <Letters
        unit={wh}
        letters={Array.from(nameArray.join(''))}
        coords={coords}
      />
    </div>
  )
}

function Letters({
  letters,
  coords,
  unit,
}: {
  unit: number
  letters: string[]
  coords: [number, number][]
}) {
  const [active, setActive] = useState<number | null>(null)

  const lettersMarkup = letters.map((l, index) => {
    const position = coords[index] || [100, 100]
    const wordLengths = nameArray.map((word) => word.length)

    let inWord

    if (index === 0 || wordLengths[0] >= index + 1) {
      inWord = 0
    } else if (
      wordLengths[0] < index + 1 &&
      wordLengths[0] + wordLengths[1] >= index + 1
    ) {
      inWord = 1
    } else {
      inWord = 2
    }

    let activeWord

    if (active === 0 || (active && wordLengths[0] >= active + 1)) {
      activeWord = 0
    } else if (
      active &&
      wordLengths[0] < active + 1 &&
      wordLengths[0] + wordLengths[1] >= active + 1
    ) {
      activeWord = 1
    } else if (
      active &&
      wordLengths[0] + wordLengths[1] < active + 1 &&
      wordLengths[0] + wordLengths[1] + wordLengths[2] > active + 1
    ) {
      activeWord = 2
    } else {
      activeWord = null
    }

    return (
      <Letter
        unit={unit / 4}
        coords={position}
        key={`${l}${index}`}
        letter={l.toUpperCase()}
        allActive={active === null}
        active={active === null || activeWord === inWord}
        onMouseOver={() => {
          setActive(index)
        }}
        onMouseOut={() => setActive(null)}
      />
    )
  })

  return <>{lettersMarkup}</>
}

interface LetterProps {
  unit: number
  letter: string
  coords: [number, number]
  active: boolean
  onMouseOver: () => void
  onMouseOut: () => void
}

function Letter({
  letter,
  onMouseOver,
  onMouseOut,
  coords,
  unit,
  allActive,
  active,
}: LetterProps) {
  return (
    <a
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      className={clsx({'Character--active': active, Character: true})}
      style={{
        height: unit,
        width: unit,
        transform: `translate(${coords[0]}px, ${coords[1]}px)`,
      }}
    >
      <Route active={active} allActive={allActive} unit={unit} />
      <span
        style={{
          background: 'white',
          borderRadius: '100%',
          position: 'relative',
          display: 'block',
          height: unit / 3.5,
          width: unit / 3.5,
          lineHeight: `${unit / 3.5}px`,
        }}
      >
        {letter}
      </span>
    </a>
  )
}

const SHOW_VALUE = 308

const Route = ({unit, allActive, active}: {unit: number; active: boolean}) => {
  const [rotation1, setRotation1] = useState<number>(0)
  const [rotation2, setRotation2] = useState<number>(0)
  const [rotation3, setRotation3] = useState<number>(0)
  const sizes = [0, 45, 90, 135, 180, 225, 270, 315, 360]

  useEffect(() => {
    setRotation1(sizes[Math.floor(Math.random() * sizes.length)])
    setRotation2(sizes[Math.floor(Math.random() * sizes.length)])
    setRotation3(sizes[Math.floor(Math.random() * sizes.length)])
  }, [])

  useInterval(() => {
    setRotation1(sizes[Math.floor(Math.random() * sizes.length)])
    setRotation2(sizes[Math.floor(Math.random() * sizes.length)])
    setRotation3(sizes[Math.floor(Math.random() * sizes.length)])
  }, 2000)

  const trails = [rotation1, rotation2].map((rot, index) =>
    useTrail(2, {
      config: {mass: 5, tension: 2000, friction: 200},
      to: {
        opacity: 1,
        height: unit,
        width: unit,
        transform:
          active && !allActive
            ? index === 0
              ? `rotate(90deg)`
              : `rotate(-90deg)`
            : `rotate(${rot + 45}deg)`,
        color: active ? 'currentColor' : 'currentColor',
      },
    }),
  )

  return (
    <div className="route">
      <svg viewBox="0 0 100 100">
        {trails.map((trail, index1) =>
          trail.map((style, index) => (
            <animated.line
              key={index}
              className="route__path"
              x1="50"
              y1="50"
              x2="100"
              y2="100"
              // x2={[74, 100, 68][index1]}
              // y2={[74, 100, 68][index1]}
              strokeDasharray={SHOW_VALUE}
              style={style}
              // stroke={['blue', 'blue', 'blue'][index1]}
            />
          )),
        )}
      </svg>
    </div>
  )
}
