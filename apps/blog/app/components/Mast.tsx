import {Link} from '@remix-run/react'
import {Content} from './Content'

interface MastProps {
  links: {content: string; href: string}[]
}

export function Mast({links = []}: MastProps) {
  return (
    <>
      <div className="Locations">
        <div className="Location">
          <p>
            <span className="mono">Berlin, Tempelhofer Feld</span>
            <br />
            <span className="sans">Every Thursday, 20:20</span>
          </p>
        </div>
        <div className="Location">
          <p>
            <span className="mono">Kelowna, Mission Creek</span>
            <br />
            <span className="sans">Coming soon</span>
          </p>
        </div>
      </div>
      <h1 className="Title">Distance/time</h1>

      <div className="Nav">
        {links.map((link) => (
          <Link className="Link" to={link.href}>
            {link.content}
          </Link>
        ))}
      </div>
    </>
  )
}
