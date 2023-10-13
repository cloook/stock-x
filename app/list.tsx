"use client"
import { invoke } from "@tauri-apps/api/tauri"
import React, { useEffect, useState } from "react"
import StockProcess from "./components/stockProcess"

type StockItem = {
  code: String
  name: String
  price: Number
  percent: Number
  high_price: Number
  low_price: Number
}

function caclPercent(percent: Number) {
  if (percent.valueOf() >= 0) {
    return [50, 0, percent.valueOf()*5, 50 - percent.valueOf()*5];
  } else {
    const p = Math.abs(percent.valueOf()) *5;
    return [50 - p, p, 0, 50];
  }
}

export function List() {
  const items: Array<StockItem> = [];
  const [list, setList] = useState(items);

  useEffect(() => {
    fetchList();
  }, [])

  const fetchList = () => {
    console.log("fetchList");
    invoke<Array<StockItem>>("stcok_list")
      .then((res) => {
        setList(res)
      })
      .catch(console.error)
  }

  return (
    <div className="grid gr-181">
      <div>list2</div>
      <div className="grid grid-cols-1">
        {list.map((item, index) => (
          <div key={index} className="bg-indigo-600 mx-4 h-8 flex items-center justify-center">
              <StockProcess columnWidths={caclPercent(item.percent)}/>
            {item.code}/{item.price.valueOf()}/{item.percent.valueOf()}
          </div>
        ))}
      </div>
      <div className="row-span-1"><XButton onClick={fetchList} /></div>
    </div>
  )
}

type XButtonProps = {
  onClick: () => void
}

const XButton: React.FC<XButtonProps> = ({ onClick }) => {
  useEffect(() => {
    console.log("useEffect")
  }, [])

  return <button onClick={onClick}>Refresh</button>
}
