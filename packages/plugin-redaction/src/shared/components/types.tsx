import { MenuWrapperProps } from '@embedpdf/core/@framework';
import { Rect } from '@embedpdf/models';
import { RedactionItem } from '@embedpdf/plugin-redaction';

export interface SelectionMenuProps {
  menuWrapperProps: MenuWrapperProps;
  pageIndex: number;
  item: RedactionItem;
  selected: boolean;
  rect: Rect;
}
