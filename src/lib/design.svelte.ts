export type DesignKey = 'a' | 'b';

const QS_KEY = 'design';

const readFromUrl = (): DesignKey => {
  if (typeof window === 'undefined') return 'a';
  const v = new URLSearchParams(window.location.search).get(QS_KEY);
  if (v === 'b') return 'b';
  return 'a';
};

export const designState = $state<{ design: DesignKey }>({
  design: readFromUrl(),
});

export const setDesign = (d: DesignKey) => {
  if (designState.design === d) return;
  designState.design = d;
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set(QS_KEY, d);
    window.history.replaceState(null, '', url.toString());
  }
};
