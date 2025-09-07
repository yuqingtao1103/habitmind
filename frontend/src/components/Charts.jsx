import { useEffect, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, TimeScale
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, TimeScale)

export function WeekBar({ items }) {
  const labels = items.map(i => i.date.slice(5,10)) // MM-DD
  const data = {
    labels,
    datasets: [{ label: 'Done', data: items.map(i => i.status ? 1 : 0) }]
  }
  return <Bar data={data} />
}

export function StreakLine({ current, longest }) {
  const labels = ['Current', 'Longest']
  const data = { labels, datasets: [{ label: 'Days', data: [current, longest] }] }
  return <Line data={data} />
}
