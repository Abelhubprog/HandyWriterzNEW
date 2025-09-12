import { ReactNode } from 'react';

export type BlockType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'code'
  | 'quote'
  | 'divider';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
}

export interface MediaBlock extends BaseBlock {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  alt?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language?: string;
  highlightLines?: number[];
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  attribution?: string;
  style?: 'default' | 'highlight' | 'callout';
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style?: 'line' | 'dots' | 'spaced';
}

export type ContentBlock = 
  | TextBlock 
  | HeadingBlock 
  | MediaBlock 
  | CodeBlock 
  | QuoteBlock 
  | DividerBlock;

export interface BlockComponentProps {
  block: ContentBlock;
  isEditing: boolean;
  isSelected: boolean;
  onChange: (block: ContentBlock) => void;
  onFocus: () => void;
  onBlur: () => void;
  children?: ReactNode;
}

export interface BlockToolbarProps {
  block: ContentBlock;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onTypeChange: (type: BlockType) => void;
}
