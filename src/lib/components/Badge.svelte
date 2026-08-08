<script lang="ts">
  import type { Snippet } from 'svelte';
  type Tone = 'neutral' | 'ok' | 'bad' | 'brand' | 'city';
  let { tone = 'neutral', children }: { tone?: Tone; children: Snippet } = $props();
  const tones: Record<Tone, string> = {
    neutral: 'bg-black/5 text-deep',
    ok: 'bg-forest text-white',
    bad: 'bg-red-700 text-white',
    brand: 'bg-teal/15 text-teal',
    city: 'bg-orange-100 text-orange-800'
  };
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {tones[tone]}">
  {@render children()}
</span>
