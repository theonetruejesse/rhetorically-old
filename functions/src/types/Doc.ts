// blessed be sammuel altman. types generated from:
// https://developers.google.com/docs/api/reference/rest/v1/documents/request

// only defined types that actually used, define more as requests needed
// end-to-end typing for InsertTextRequest, UpdateTextStyleRequest supported
export type DocRequestBody = {
  insertText?: InsertTextRequest;
  updateTextStyle?: UpdateTextStyleRequest;
  // ... Add other request types as needed
};

export type InsertTextRequest = {
  text: string;
  location?: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
};

export type UpdateTextStyleRequest = {
  textStyle: TextStyle;
  fields: string;
  range?: TextRange;
};

export type TextRange = {
  segmentId?: string;
  startIndex: number;
  endIndex: number;
};

export type Location = {
  segmentId: string;
  index: number;
};

export type EndOfSegmentLocation = {
  segmentId: string;
};

export type TextStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  smallCaps?: boolean;
  backgroundColor?: OptionalColor;
  foregroundColor?: OptionalColor;
  fontSize?: Dimension;
  weightedFontFamily?: WeightedFontFamily;
  baselineOffset?: BaselineOffset;
  link?: Link;
};

export type OptionalColor = {
  color?: Color;
};

export type Color = {
  rgbColor: RgbColor;
};

export type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

export type Dimension = {
  magnitude: number;
  unit: Unit;
};

export enum Unit {
  UNIT_UNSPECIFIED,
  PT,
}

export type WeightedFontFamily = {
  fontFamily: string;
  weight: number;
};

export type Link = {
  // Union field destination can be only one of the following:
  url: string;
  bookmarkId: string;
  headingId: string;
  // End of list of possible types for union field destination.
};

export enum BaselineOffset {
  BASELINE_OFFSET_UNSPECIFIED,
  NONE,
  SUPERSCRIPT,
  SUBSCRIPT,
}
