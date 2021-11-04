<script>
	import { onMount } from 'svelte'

	import TimeSheet from './components/TimeSheet.svelte'
	import Payouts from './components/Payouts.svelte'

	onMount(() => {
		if (isProduction) {
			// show basic password prompt: MUCH SECURE; SUCH WOW
			let password = prompt('Enter password')
			while (password !== 'batman') {
				password = prompt('Enter password')
			}
		}
	})
</script>

<main>
	<TimeSheet />
	<Payouts />
</main>

<style>
	main {
		height: 100vh;
		overflow-y: hidden;
		display: grid;
		grid-gap: 2rem;
		grid-template-columns: 1fr 2fr;
		padding: 0 1rem;
	}
</style>