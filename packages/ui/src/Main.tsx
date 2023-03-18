import './Main.css'

export function Main({children}: React.PropsWithChildren) {
  return <main className="Main">{children}</main>
}

export function Section({children}: React.PropsWithChildren) {
  return <section className="Section Section__right">{children}</section>
}
