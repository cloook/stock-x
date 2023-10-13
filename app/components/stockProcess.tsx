import React from "react"

interface StockProcessProps {
  columnWidths: number[]
}

function StockProcess({ columnWidths }: StockProcessProps) {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `${columnWidths[0]}% ${columnWidths[1]}% ${columnWidths[2]}% ${columnWidths[3]}%`
  }

  return <div className="w-screen mx-2 grid" style={gridStyle}>
    <div className="bg-indigo-600"></div>
    <div className="bg-emerald-500">&nbsp;</div>
    <div className="bg-pink-500">&nbsp;</div>
    <div className="bg-indigo-600"></div>
  </div>
}

export default StockProcess
