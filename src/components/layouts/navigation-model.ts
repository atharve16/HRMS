import type { NavigationItem, NavigationSection } from "@/types/navigation";

export const DESKTOP_SIDEBAR_VISIBILITY_CLASS = "hidden lg:flex";
export const MOBILE_NAVIGATION_VISIBILITY_CLASS = "lg:hidden";
export const DESKTOP_SIDEBAR_MARKER_CLASS = "dashboard-sidebar";
export const MOBILE_NAVIGATION_MARKER_CLASS = "dashboard-mobile-navigation";
export const MOBILE_BOTTOM_NAVIGATION_SAFE_AREA_CLASS = "mobile-bottom-navigation";

function flattenItem(item: NavigationItem): NavigationItem[] {
  if (!item.children?.length) return [item];
  return item.children.flatMap(flattenItem);
}

export function flattenNavigationItems(navigation: NavigationSection[]) {
  const seen = new Set<string>();
  const items: NavigationItem[] = [];

  for (const section of navigation) {
    for (const item of section.items) {
      for (const destination of flattenItem(item)) {
        if (seen.has(destination.href)) continue;
        seen.add(destination.href);
        items.push(destination);
      }
    }
  }

  return items;
}

export function getActiveNavigationHref(
  pathname: string,
  navigation: NavigationItem[],
) {
  const matchingItems = navigation.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return matchingItems.sort((left, right) => right.href.length - left.href.length)[0]
    ?.href;
}
