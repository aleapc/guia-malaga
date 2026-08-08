<script lang="ts">
  import TopBar from '$lib/components/TopBar.svelte';
  import { photoCredits } from '$lib/photoCredits';

  const entries = Object.entries(photoCredits);
</script>

<TopBar title="Créditos das fotos" />

<main class="space-y-4 p-4 pb-12">
  <p class="text-sm text-deep/75">
    As fotos são de bancos livres do <strong>Wikimedia Commons</strong> (licenças Creative Commons ou domínio
    público), usadas com atribuição. Imagens de comida/roupa são ilustrativas. A previsão do tempo vem do
    <strong>Open-Meteo</strong>.
  </p>
  <ul class="space-y-2">
    {#each entries as [file, credit] (file)}
      <li class="rounded-xl bg-white p-3 text-sm shadow-sm">
        <span class="font-mono text-xs text-deep/50">{file}</span>
        <p class="text-deep/80">{credit}</p>
      </li>
    {/each}
  </ul>
</main>
