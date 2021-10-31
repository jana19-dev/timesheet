<script>
  import { clickOutside } from '../utils/clickOutside.js'

  export let date
  let isEditing = false

  const handleClickOutside = () => {
		isEditing = false
	}

  const onKeyPress = e => {
    if (['Enter', 'Escape'].includes(e.key)) {
      isEditing = false
    }
  }
</script>

<div on:dblclick={() => isEditing = !isEditing} use:clickOutside on:click_outside={handleClickOutside}>
  {#if isEditing}
    <input type="date" value={date.toLocaleDateString('en-ca')} on:change on:keyup={onKeyPress} />
  {:else}
    {date.toDateString()}
  {/if}
</div>
