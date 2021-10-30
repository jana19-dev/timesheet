<script>
	import { onMount } from 'svelte'
	import { data } from '../utils/stores.js'

	import { Timestamp, collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore'
	import { db } from '../utils/firebase'

	import DateEditor from './DateEditor.svelte'
	import TimeEditor from './TimeEditor.svelte'

	onMount(async () => {
		const q = query(collection(db, 'days'), orderBy("date", "desc"))
		const querySnapshot = await getDocs(q)
		data.update(() => querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })))
	})

	const onDateChange = (id, value) => {
		const updatedDate = new Date(value.replace(/-/g, '/'))
		const newTimestamp = Timestamp.fromDate(updatedDate)
		data.update(currentData => currentData.map(d => d.id === id ? {...d, date: newTimestamp} : d))
		const firebaseRef = doc(db, "days", id)
		updateDoc(firebaseRef, { date: newTimestamp })
	}

	const onTimeChange = (field, day, value) => {
		const updatedDate = new Date(day.date.toDate().toDateString() + ' ' + value)
		const newTimestamp = Timestamp.fromDate(updatedDate)
		data.update(currentData => currentData.map(d => d.id === day.id ? {...d, [field]: newTimestamp} : d))
		const firebaseRef = doc(db, "days", day.id)
		updateDoc(firebaseRef, { [field]: newTimestamp })
	}

	let activeRow
	const addActiveRow = (id) => {
		activeRow = id
	}
	const removeActiveRow = () => {
		activeRow = null
	}
</script>

<div class="timesheet">
	<h2>Time Sheet</h2>
	<table>
		<thead>
			<tr>
				<th class="date">Date</th>
				<th>In</th>
				<th>Out</th>
				<th class="hours">Hours</th>
			</tr>
		</thead>
		<tbody>
			{#each $data as day}
				<tr class:active-row={activeRow === day.id} on:mouseenter={() => addActiveRow(day.id)} on:mouseleave={removeActiveRow}>
					<td class="date">
						<DateEditor date={day.date.toDate()} on:change={e => onDateChange(day.id, e.target.value)} />
					</td>
					<td>
						<TimeEditor date={day.start.toDate()} on:change={e => onTimeChange('start', day, e.target.value)} />
					</td>
					<td>
						<TimeEditor date={day.end.toDate()} on:change={e => onTimeChange('end', day, e.target.value)} />
					</td>
					<td class="hours">
						{(day.end.toDate() - day.start.toDate())/3600000}
					</td>
				</tr>
			{/each}
	</table>
</div>

<style>
	h2 {
		text-align: center;
	}

	table {
		width: 100%;
		border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
	}

	thead tr {
    background-color: #009879;
    color: #ffffff;
    text-align: left;
	}

	th, td {
		text-align: center;
		padding: 12px 15px;
	}

	tbody tr {
    border-bottom: 1px solid #dddddd;
	}

	tbody tr:last-of-type {
    border-bottom: 2px solid #009879;
	}

	tbody tr.active-row {
    background-color: rgb(228, 247, 250);
	}

	.date {
		text-align: left;
	}

	.hours {
		text-align: end;
	}

	td.hours {
		font-weight: bold;
	}
</style>