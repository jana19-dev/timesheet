<script>
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	import { dataTimesheet } from '../utils/stores.js'
	import { hoursInDayRangeRegular, hoursInDayRangeOT } from '../utils/calc.js'

	import { Timestamp, collection, getDocs, query, orderBy, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
	import { db } from '../utils/firebase'

	import DateEditor from './DateEditor.svelte'
	import TimeEditor from './TimeEditor.svelte'

	let isMounted = false
	let isLoading = true
	onMount(async () => {
		const q = query(collection(db, 'days'), orderBy("date", "desc"))
		const querySnapshot = await getDocs(q)
		dataTimesheet.update(() => querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })))
		isLoading = false
		setTimeout(() => {
			isMounted = true
		}, 1000);
	})

	const onDateChange = (id, value) => {
		const updatedDate = new Date(value.replace(/-/g, '/'))
		const newTimestamp = Timestamp.fromDate(updatedDate)
		dataTimesheet.update(currentData => currentData.map(d => d.id === id ? {...d, date: newTimestamp} : d))
		const firebaseRef = doc(db, "days", id)
		updateDoc(firebaseRef, { date: newTimestamp })
	}

	const onTimeChange = (field, day, value) => {
		const updatedDate = new Date(day.date.toDate().toDateString() + ' ' + value)
		const newTimestamp = Timestamp.fromDate(updatedDate)
		const otherField = field === 'start' ? 'end' : 'start'
		const otherUpdatedDate = new Date(day.date.toDate().toDateString() + ' ' + day[otherField].toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
		const otherNewTimestamp = Timestamp.fromDate(otherUpdatedDate)
		dataTimesheet.update(currentData => currentData.map(d => d.id === day.id ? {...d, [field]: newTimestamp, [otherField]: otherNewTimestamp} : d))
		const firebaseRef = doc(db, "days", day.id)
		updateDoc(firebaseRef, { [field]: newTimestamp, [otherField]: otherNewTimestamp })
	}

	const onDelete = (id) => {
		if (confirm('Are you sure you want to delete this day?')) {
			dataTimesheet.update(currentData => currentData.filter(d => d.id !== id))
			const firebaseRef = doc(db, "days", id)
			deleteDoc(firebaseRef)
		}
	}

	const onAddNew = async () => {
		const newEntry = {
			date: Timestamp.fromDate(new Date(new Date().toLocaleDateString().replace(/-/g, '/'))),
			start: Timestamp.fromDate(new Date(new Date().toLocaleDateString().replace(/-/g, '/') + ' 10:00')),
			end: Timestamp.fromDate(new Date(new Date().toLocaleDateString().replace(/-/g, '/') + ' 20:00'))
		}
		const newEntryRef = await addDoc(collection(db, "days"), newEntry)
		dataTimesheet.update(currentData => [{...newEntry, id: newEntryRef.id}, ...currentData])
	}

	const onRefresh = async () => {
		if (isMounted) {
			isLoading = true
			const q = query(collection(db, 'days'), orderBy("date", "desc"))
			const querySnapshot = await getDocs(q)
			dataTimesheet.update(() => querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })))
			isLoading = false
		}
	}

	let activeRow
	const addActiveRow = (id) => {
		activeRow = id
	}
	const removeActiveRow = () => {
		activeRow = null
	}
</script>

<div>
	<h2>Time Sheet</h2>
	<div class="actions">
		<button class="add-new" on:click={onAddNew}><i class="fa fa-plus"></i> NEW</button>
		<button class="add-new" on:click={onRefresh}>REFRESH <i class="fa fa-refresh"></i></button>
	</div>
	{#if isLoading}
		<div class="loading">Loading...</div>
	{/if}
	<div id="table-wrapper">
  	<div id="table-scroll">
			<table>
				<thead>
					<tr>
						<th class="date">Date</th>
						<th>In</th>
						<th>Out</th>
						<th class="hours">Hours</th>
						<th class="hours">OT</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each $dataTimesheet as day (day.id)}
						<tr class:active-row={activeRow === day.id} on:mouseenter={() => addActiveRow(day.id)} on:mouseleave={removeActiveRow} out:fly="{{ x: 400, duration: 500 }}" in:fly="{isMounted && { y: -200, duration: 500 }}">
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
								{hoursInDayRangeRegular(day)}
							</td>
							<td class="hours">
								{hoursInDayRangeOT(day)}
							<td>
								<button class="delete" on:click={() => onDelete(day.id)}>
									<i class="fa fa-trash"></i>
								</button>
							</td>
						</tr>
					{/each}
			</table>
		</div>
	</div>
</div>

<style>
	h2 {
		text-align: center;
		margin: 0.5rem;
		color: #009879;
	}

	.loading {
		text-align: center;
		font-weight: bold;
		margin: 0.5rem;
		color: rgb(10, 168, 155);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin: 0.5rem;
	}

	#table-wrapper {
		position:relative;
	}

	#table-scroll {
		height: calc(100vh - 5rem);
		overflow:auto;
	}

	th {
    background-color: #009879;
  	position: sticky;
 	 	top: 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
    margin: 5px 0;
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

	.delete {
		background: none;
		border: none;
		cursor: pointer;
	}

	.fa-trash {
		color: rgb(255, 0, 0);
	}

	.add-new {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;
		color: #009879;
		margin: none;
	}
</style>