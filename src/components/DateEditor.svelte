<script>
  import { clickOutside } from '../utils/clickOutside.js'

  export let date
  let isEditing = false

  const handleClickOutside = () => {
		isEditing = false
	}
</script>

<div on:dblclick={() => isEditing = !isEditing} use:clickOutside on:click_outside={handleClickOutside}>
  {#if isEditing}
    <input type="date" value={date.toLocaleDateString('en-ca')} on:change />
  {:else}
    {date.toDateString()}
  {/if}
</div>
