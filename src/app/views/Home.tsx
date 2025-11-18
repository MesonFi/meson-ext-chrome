// src/app/views/Home.tsx
import React from "react"
import { Button } from "~/components/Button"
import ViewX402List from "./x402/ViewX402List"

type Props = {
  mode?: "popup" | "sidepanel"
}

const Home: React.FC<Props> = ({ mode = "popup" }) => {
  return (
    <div className="space-y-2 h-full">
      <ViewX402List mode={mode} />
    </div>
  )
}

export default Home
