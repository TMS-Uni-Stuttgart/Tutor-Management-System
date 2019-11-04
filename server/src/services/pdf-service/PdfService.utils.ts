import { ConverterOptions } from 'showdown';

export const MARKDOWN_OPTIONS: Readonly<ConverterOptions> = {
  ghCodeBlocks: true,
  omitExtraWLInCodeBlocks: true,
  extensions: [],
  simpleLineBreaks: true,
  emoji: true,
};
