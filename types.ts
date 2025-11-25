
export enum ViewState {
  HOME = 'HOME',
  DRAW = 'DRAW',
  GALLERY = 'GALLERY'
}

export interface NavItem {
  label: string;
  view: ViewState;
  color: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', view: ViewState.HOME, color: 'bg-blue-400' },
  { label: 'Рисовать!', view: ViewState.DRAW, color: 'bg-pink-400' },
  { label: 'Мои Рисунки', view: ViewState.GALLERY, color: 'bg-yellow-400' },
];
