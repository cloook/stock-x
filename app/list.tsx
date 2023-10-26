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

function symbol(items: Array<StockItem>) {
  return items.map((e) => e.code).join(",")
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

function moveElementToFirst<T>(array: T[], index: number): T[] {
  if (index < 0 || index >= array.length) {
    return array
  }

  const elementToMove = array[index]
  const newArray = [
    elementToMove,
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ]
  return newArray
}

export function List() {
  const items: Array<StockItem> = []
  const [list, setList] = useState(items)
  const [editShow, seteEditShow] = useState(false)
  const [addShow, seteAddShow] = useState(false)
  const [addCode, seteAddCode] = useState('')

  const resetAddCode = () => {
    seteAddCode('');
    seteAddShow(false);
  }

  const saveAddCode = () => {
    list.push({ code: 'SH' + addCode, name: '', price: 0, percent: 0, high_price: 0, low_price: 0});
    setList(list);
    updateSort();
    resetAddCode();
  }

  const edit = () => {
    if (editShow) {
      // save
      updateSort()
    }
    seteEditShow(!editShow)
  }

  const changeSort = (index: number) => {
    const newList = moveElementToFirst(list, index)
    setList(newList)
  }

  const updateSort = () => {
    invoke<string>("update_and_sort", { newList: symbol(list) })
      .then(console.log)
      .catch(console.error)
    refresh();
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
        {editShow && (
          <div className="flex justify-between mx-5 border-b-2">
            <p>名称</p>
            <p>排序</p>
          </div>
        )}
        {list.map((item, index) => (
          <div key={index}>
            {editShow && (
              <div className="flex justify-between mx-5">
                <p>{item.name}</p>
                <div className="cursor-grab" onClick={() => changeSort(index)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
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
        {addShow && (
          <div className="flex flex-row">
            <p>SH</p>
            <input
              type="text"
              value={addCode}
              onChange={(e) => seteAddCode(e.target.value)}
              placeholder="输入股票代码, 如601012"
              className="border-1 ml-1 w-2/3 bg-neutral-700"
            />
            <div className="ml-1 text-green-500" onClick={saveAddCode}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>
            <div className="ml-2 text-rose-500" onClick={resetAddCode}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        )}
        {editShow && (
          <div
            className="flex m-7 w-4/5 justify-center items-center border-dashed border-2 border-green-500/100 cursor-grab"
            onClick={() => seteAddShow(true)}
          >
            +
          </div>
        )}
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
