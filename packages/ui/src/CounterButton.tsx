import * as React from 'react'

export const CounterButton = () => {
  const [count, setCount] = React.useState(0)
  return (
    <div>
      <p style={{margin: '0 0 1.5rem 0'}}>
        This component is from <code>ui</code>
      </p>
      <div>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </div>
    </div>
  )
}
