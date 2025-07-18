<script lang="ts">
  let name = $state('world');
</script>

<main class="flex h-screen items-center justify-center bg-gray-100 font-sans">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-800">Svelte + EmbedPDF</h1>
    <p class="mt-2 text-lg text-gray-600">PDF Viewer will be rendered here. Hello {name}!</p>
  </div>
</main>