<script>
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	import { dataPayouts, dataTimesheet } from '../utils/stores.js'
	import { hoursInDaysRange, hoursInDaysRangeRegular, hoursInDaysRangeOT, daysInRange, calcPayRegular, calcPayOT } from '../utils/calc.js'

	import { Timestamp, collection, getDocs, query, orderBy, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
	import { db } from '../utils/firebase'

	import DateEditor from './DateEditor.svelte'

	let isMounted = false
	let isLoading = true
	onMount(async () => {
		const q = query(collection(db, 'payouts'), orderBy("start", "desc"))
		const querySnapshot = await getDocs(q)
		dataPayouts.update(() => querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })))
		isLoading = false
		setTimeout(() => {
			isMounted = true
		}, 1000);
	})

	const onDateChange = (field, id, value) => {
		const updatedDate = new Date(value.replace(/-/g, '/'))
		const newTimestamp = Timestamp.fromDate(updatedDate)
		dataPayouts.update(currentData => currentData.map(d => d.id === id ? {...d, [field]: newTimestamp} : d))
		const firebaseRef = doc(db, "payouts", id)
		updateDoc(firebaseRef, { [field]: newTimestamp })
	}

	const onDelete = (id) => {
		if (confirm('Are you sure you want to delete this payout?')) {
			dataPayouts.update(currentData => currentData.filter(d => d.id !== id))
			const firebaseRef = doc(db, "payouts", id)
			deleteDoc(firebaseRef)
		}
	}

	const onAddNew = async () => {
		const newEntry = {
			start: Timestamp.fromDate(new Date(new Date().toLocaleDateString().replace(/-/g, '/'))),
			end: Timestamp.fromDate(new Date(new Date().toLocaleDateString().replace(/-/g, '/')))
		}
		const newEntryRef = await addDoc(collection(db, "payouts"), newEntry)
		dataPayouts.update(currentData => [{...newEntry, id: newEntryRef.id}, ...currentData])
	}

	const onRefresh = async () => {
		if (isMounted) {
			isLoading = true
			const q = query(collection(db, 'payouts'), orderBy("date", "desc"))
			const querySnapshot = await getDocs(q)
			dataPayouts.update(() => querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })))
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
	<h2>Estimated Payouts</h2>
	<div class="actions">
		<button class="add-new" on:click={onAddNew}><i class="fa fa-plus"></i> NEW</button>
		<button class="add-new" on:click={onRefresh}>REFRESH <i class="fa fa-refresh"></i></button>
	</div>
	{#if isLoading}
		<div class="loading">Loading...</div>
	{/if}
	<table>
		<thead>
			<tr>
				<th class="date">Start</th>
				<th class="date">End</th>
				<th class="numeric">Days</th>
				<th class="numeric">Hours</th>
				<th class="numeric">OT</th>
				<th class="numeric">Pay</th>
				<th class="numeric">Pay OT</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each $dataPayouts as day (day.id)}
				<tr class:active-row={activeRow === day.id} on:mouseenter={() => addActiveRow(day.id)} on:mouseleave={removeActiveRow} out:fly="{{ x: 400, duration: 500 }}" in:fly="{isMounted && { y: -200, duration: 500 }}">
					<td class="date">
						<DateEditor date={day.start.toDate()} on:change={e => onDateChange('start', day.id, e.target.value)} />
					</td>
					<td class="date">
						<DateEditor date={day.end.toDate()} on:change={e => onDateChange('end', day.id, e.target.value)} />
					</td>
					<td class="numeric">
						{daysInRange($dataTimesheet, day.start, day.end)}
					</td>
					<td class="numeric">
						{hoursInDaysRangeRegular($dataTimesheet, day.start, day.end)}
					</td>
					<td class="numeric">
						{hoursInDaysRangeOT($dataTimesheet, day.start, day.end)}
					</td>
					<td class="numeric">
						{calcPayRegular(hoursInDaysRange($dataTimesheet, day.start, day.end), daysInRange($dataTimesheet, day.start, day.end))}
					</td>
					<td class="numeric">
						{calcPayOT(hoursInDaysRange($dataTimesheet, day.start, day.end), daysInRange($dataTimesheet, day.start, day.end))}
					</td>
					<td>
						<button class="delete" on:click={() => onDelete(day.id)}>
							<i class="fa fa-trash"></i>
						</button>
					</td>
				</tr>
			{/each}
	</table>
</div>

<style>
	h2 {
		text-align: center;
		margin: 0.5rem;
		color: rgb(102, 16, 201);

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
    background-color: rgb(102, 16, 201);
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
    border-bottom: 2px solid rgb(102, 16, 201);
	}

	tbody tr.active-row {
    background-color: rgb(228, 247, 250);
	}

	.date {
		text-align: left;
	}

	.numeric {
		text-align: end;
	}

	td.numeric {
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
		color: rgb(102, 16, 201);
		margin: none;
	}
</style>