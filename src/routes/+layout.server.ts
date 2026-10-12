import { navigation } from '#lib/server/content.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
  return { nav: navigation() };
};
