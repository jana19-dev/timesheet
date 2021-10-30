<script>
	import TimeSheet from './components/TimeSheet.svelte'
	import Payouts from './components/Payouts.svelte'
</script>

<main>
	<TimeSheet />
	<Payouts />
</main>

<style>
	main {
		height: 100vh;
		display: grid;
		grid-gap: 2rem;
		grid-template-columns: 1fr 1.5fr;
		overflow-y: auto;
		padding: 0 1rem;
	}
</style>