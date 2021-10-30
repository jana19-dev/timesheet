<script>
	import TimeSheet from './components/TimeSheet.svelte'
</script>

<main>
	<TimeSheet />
</main>

<style>
	main {
		height: 100vh;
		display: grid;
		grid-template-columns: 1fr 2fr;
		overflow-y: auto;
		padding: 0 1rem;
	}
</style>