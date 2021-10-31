<script>
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	import { dataPayouts, dataTimesheet } from '../utils/stores.js'
	import { hoursInDaysRange, hoursInDaysRangeRegular, hoursInDaysRangeOT, daysInRange, maxHoursInDaysRange, calcPayRegular, calcPayOT } from '../utils/calc.js'

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
			const q = query(collection(db, 'payouts'), orderBy("start", "desc"))
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
	<div id="table-wrapper">
  	<div id="table-scroll">
			<table>
				<thead>
					<tr>
						<th class="date">Start</th>
						<th class="date">End</th>
						<th class="numeric">Days</th>
						<th class="numeric">Hours</th>
						<th class="numeric">OT</th>
						<th class="numeric">Pay</th>
						<th class="numeric">OT</th>
						<th class="numeric">Vacay</th>
						<th class="numeric">Gross</th>
						<th class="numeric">CPP</th>
						<th class="numeric">EI</th>
						<th class="numeric">Tax</th>
						<th class="numeric">Net</th>
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
								{daysInRange($dataTimesheet, day)}
							</td>
							<td class="numeric">
								{hoursInDaysRangeRegular($dataTimesheet, day)}
							</td>
							<td class="numeric">
								{hoursInDaysRangeOT($dataTimesheet, day)}
							</td>
							<td class="numeric bold">
								{parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold">
								{parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold">
								{((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold">
								{(parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold negative">
								{((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.0513).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold negative">
								{((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.0158).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold negative">
								{((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.169906680620).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</td>
							<td class="numeric bold net">
								{((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) - ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.0513) - ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.0158) - ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + ((parseFloat(calcPayRegular(hoursInDaysRangeRegular($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day))) + parseFloat(calcPayOT(hoursInDaysRangeOT($dataTimesheet, day), maxHoursInDaysRange($dataTimesheet, day)))) * 0.04)) * 0.169906680620)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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
	</div>
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
		color: rgb(102, 16, 201);
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
    background-color: rgb(102, 16, 201);
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

	.negative {
		color: rgb(185, 138, 9);
	}

	.net {
		color: rgb(8, 131, 121);
		font-weight: bolder;
		font-size: 16px;
	}

	.negative:before {
		content: '-';
	}

	td.bold {
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