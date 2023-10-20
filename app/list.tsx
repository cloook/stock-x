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
    const caclPercent = percent.valueOf() * 5
    const p = caclPercent > 50 ? 50 : caclPercent
    return [50, 0, p, 50 - p]
  } else {
    const caclPercent = Math.abs(percent.valueOf()) * 5
    const p = caclPercent > 50 ? 50 : caclPercent
    return [50 - p, p, 0, 50]
  }
}

export function List() {
  const items: Array<StockItem> = []
  const [list, setList] = useState(items)
  const [editShow, seteEditShow] = useState(false)

  const edit = () => {
    if (editShow) {
      // save
    }
    seteEditShow(!editShow)
  }

  const refresh = () => {
    invoke<Array<StockItem>>("stcok_list")
      .then((res) => {
        setList(res)
      })
      .catch(console.error)
  }

  useEffect(() => {
    refresh()
    const timerId = setInterval(fetchList, 60 * 1000)
    return () => clearInterval(timerId)
  }, [])

  const fetchList = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    const isTradingHours =
      (!isWeekend && currentHour === 9 && currentMinute >= 30) || // 9:30 ~ 10:00
      currentHour === 10 || // 10:00
      (currentHour === 11 && currentMinute <= 30) || // 11:00 ~ 11:30
      currentHour === 13 ||
      currentHour === 14 || // 13:00 ~ 15:00
      (currentHour === 15 && currentMinute < 2) // last update
    if (isTradingHours) {
      invoke<Array<StockItem>>("stcok_list")
        .then((res) => {
          setList(res)
        })
        .catch(console.error)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex grow flex-col w-screen gap-4 mt-5">
        {list.map((item, index) => (
          <div key={index}>
            {editShow && (
              <div>{item.name}</div>
            )}
            {!editShow && (
              <div>
                <div className="bg-indigo-600 mx-4 h-8 flex">
                  <StockProcess columnWidths={caclPercent(item.percent)} />
                  <div className="w-1/2 text-xs flex items-center justify-center">
                    <p>{item.name}</p>
                  </div>
                </div>
                <div className="mx-4 flex text-sm w-screen items-center justify-start">
                  <p className=" basis-1/4 subpixel-antialiased font-mono">
                    {item.percent.valueOf()}%
                  </p>
                  <p className=" basis-1/4 subpixel-antialiased text-xs font-mono text-amber-500">
                    {item.price.valueOf()}
                  </p>
                  <p className=" basis-1/4 subpixel-antialiased text-xs font-mono text-green-500">
                    {item.low_price.valueOf()}
                  </p>
                  <p className=" basis-1/4 subpixel-antialiased text-xs font-mono text-pink-500">
                    {item.high_price.valueOf()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-none">
        <div
          className="flex justify-center items-center w-screen bg-sky-500 hover:bg-sky-600 cursor-grab"
          onClick={edit}
        >
          {editShow ? "保存" : "编辑"}
        </div>
      </div>
    </div>
  )
}
