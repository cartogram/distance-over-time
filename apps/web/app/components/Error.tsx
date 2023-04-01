import {Text, Main} from '@cartogram/ui'

export function Error({error}: {error: Error}) {
  return (
    <div className="Error">
      <div className="Error__inside">
        <Text>{error.message}</Text>
      </div>
    </div>
  )
}
