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
    <input type="time" step="900" value={date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} on:change on:keyup={onKeyPress} />
  {:else}
    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  {/if}
</div>
