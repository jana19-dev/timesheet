export const hoursInDayRange = (start, end) => ((end.toDate() - start.toDate()) / 3600000).toFixed(2)

export const hoursInDaysRange = (data, start, end) => {
  const dataInRange = data.filter(d => d.date.seconds >= start.seconds && d.date.seconds <= end.seconds)
  const totalHours = dataInRange.reduce((acc, d) => acc + parseFloat(hoursInDayRange(d.start, d.end)), 0).toFixed(2)
  return totalHours
}

export const hoursInDayRangeRegular = ({date, start, end}) => {
  const hours = hoursInDayRange(start, end)
  return hours
  // if ([0, 6].includes(date.toDate().getDay())) {
  //   return hours > 4 ? 4.00.toFixed(2) : hours
  // } else {
  //   return hours > 8 ? 8.00.toFixed(2) : hours
  // }
}

export const hoursInDayRangeOT = ({date, start, end}) => {
  const hours = hoursInDayRange(start, end)
  if ([0, 6].includes(date.toDate().getDay())) {
    return hours > 4 ? (hours - 4).toFixed(2) : '-'
  } else {
    return hours > 8 ? (hours - 8).toFixed(2) : '-'
  }
}

export const daysInRange = (data, {start, end}) => {
  const dataInRange = data.filter(d => d.date.seconds >= start.seconds && d.date.seconds <= end.seconds)
  return dataInRange.length
}

export const maxHoursInDaysRange = (data, {start, end}) => {
  return 88 // 2 weeks
  // let maxHours = 0
  // const dataInRange = data.filter(d => d.date.seconds >= start.seconds && d.date.seconds <= end.seconds)
  // for (const { date } of dataInRange) {
  //   if ([0, 6].includes(date.toDate().getDay())) {
  //     maxHours += 4
  //   } else {
  //     maxHours += 8
  //   }
  // }
  // return maxHours
}

export const hoursInDaysRangeRegular = (data, {start, end}) => {
  const hours = hoursInDaysRange(data, start, end)
  const maxHours = maxHoursInDaysRange(data, {start, end})
  return hours > maxHours ? maxHours.toFixed(2) : hours
}

export const hoursInDaysRangeOT = (data, {start, end}) => {
  const hours = hoursInDaysRange(data, start, end)
  const maxHours = maxHoursInDaysRange(data, {start, end})
  return hours > maxHours ? (hours - maxHours).toFixed(2) : 0
}

export const calcPayRegular = (hours, maxHours) => {
  const overtimeHours = hours - maxHours
  const normalPay = (hours - overtimeHours) * 18
  return parseFloat(normalPay).toFixed(2)
}

export const calcPayOT = (hours, maxHours) => {
  const overtimePay = hours * 18 * 1.5
  return parseFloat(overtimePay).toFixed(2)
}
