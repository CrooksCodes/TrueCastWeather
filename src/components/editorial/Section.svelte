<script lang="ts">
  interface Props {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
    children?: any;
  }
  const {
    eyebrow = '',
    title,
    subtitle = '',
    align = 'left',
    children,
  }: Props = $props();
</script>

<section class="ed-sectn" class:center={align === 'center'}>
  <header>
    {#if eyebrow}<div class="eyebrow">{eyebrow}</div>{/if}
    <h2 class="title">{title}</h2>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </header>
  <div class="body">
    {@render children?.()}
  </div>
</section>

<style>
  .ed-sectn {
    padding: 26px 6vw;
    max-width: 1240px;
    margin: 0 auto;
    position: relative;
  }
  .ed-sectn.center { text-align: center; }
  .ed-sectn.center header { margin-inline: auto; }

  header {
    margin-bottom: 14px;
    max-width: 720px;
  }
  .eyebrow {
    color: var(--accent);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .title {
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 400;
    margin: 0;
    line-height: 1;
    letter-spacing: -1.2px;
    color: var(--text);
  }
  .subtitle {
    margin: 10px 0 0;
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.5;
    max-width: 56ch;
  }
  .body { width: 100%; }

  @media (max-width: 720px) {
    .ed-sectn { padding: 22px 20px; }
    header { margin-bottom: 12px; }
  }
</style>
