// src/app/views/Home.tsx
import React from "react"
import { Button } from "~src/components/Button"
import ViewX402List from "./x402/ViewX402List"

const Home: React.FC = ({ }) => {
  return (
    <div className="pt-3 space-y-2 h-full">
      <ViewX402List />
    </div>
  )
}

export default Home
