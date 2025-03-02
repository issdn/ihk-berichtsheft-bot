<script>
  let { label, checked = $bindable(false) } = $props();
</script>

<label class="flex items-center space-x-2 cursor-pointer">
  <input
    type="checkbox"
    bind:checked
    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-300"
  />
  <span class="">{label}</span>
</label>
