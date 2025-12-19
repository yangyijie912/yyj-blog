import type { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';

const allIconComponents: Record<string, IconType> = {
  ...(FaIcons as Record<string, IconType>),
  ...(MdIcons as Record<string, IconType>),
  ...(AiIcons as Record<string, IconType>),
  ...(BiIcons as Record<string, IconType>),
  ...(BsIcons as Record<string, IconType>),
};

export const DefaultIcon: IconType = (FaIcons as Record<string, IconType>).FaLaptopCode;

export function getIconComponent(iconName?: string | null): IconType | null {
  if (!iconName) return null;
  return allIconComponents[iconName] ?? null;
}

export function listAvailableIconNames(): string[] {
  return Object.keys(allIconComponents);
}
