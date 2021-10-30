import { Timestamp, collection, getDocs, query, orderBy, where, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export const hoursInDayRange = (start, end) => ((end.toDate() - start.toDate()) / 3600000).toFixed(2)

export const hoursInDaysRange = (data, start, end) => {
  const dataInRange = data.filter(d => d.date.seconds >= start.seconds && d.date.seconds <= end.seconds)
  const totalHours = dataInRange.reduce((acc, d) => acc + parseFloat(hoursInDayRange(d.start, d.end)), 0).toFixed(2)
  return totalHours
}

export const hoursInDayRangeRegular = (start, end) => {
  const hours = hoursInDayRange(start, end)
  return hours > 8 ? 8.00.toFixed(2) : hours
}

export const hoursInDayRangeOT = (start, end) => {
  const hours = hoursInDayRange(start, end)
  return hours > 8 ? (hours - 8).toFixed(2) : '-'
}

export const hoursInDaysRangeRegular = (data, start, end) => {
  const hours = hoursInDaysRange(data, start, end)
  const days = daysInRange(data, start, end)
  const maxHours = days * 8
  return hours > maxHours ? maxHours : hours
}

export const hoursInDaysRangeOT = (data, start, end) => {
  const hours = hoursInDaysRange(data, start, end)
  const days = daysInRange(data, start, end)
  const maxHours = days * 8
  return hours > maxHours ? (hours - maxHours) : '-'
}


export const daysInRange = (data, start, end) => {
  const dataInRange = data.filter(d => d.date.seconds >= start.seconds && d.date.seconds <= end.seconds)
  return dataInRange.length
}

export const calcPayRegular = (hours, days) => {
  const overtimeHours = hours - (days * 8)
  const normalPay = (hours - overtimeHours) * 18
  return normalPay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export const calcPayOT = (hours, days) => {
  const overtimeHours = hours - (days * 8)
  const overtimePay = overtimeHours * 18 * 1.5
  return overtimePay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
