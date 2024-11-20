'use strict';
export const TextPrompt = require('./text');
export const SelectPrompt = require('./select');
export const TogglePrompt = require('./toggle');
export const DatePrompt = require('./date');
export const NumberPrompt = require('./number');
export const MultiselectPrompt = require('./multiselect');
export const AutocompletePrompt = require('./autocomplete');
export const AutocompleteMultiselectPrompt = require('./autocompleteMultiselect');
export const ConfirmPrompt = require('./confirm');
export default {
    TextPrompt,
    SelectPrompt,
    TogglePrompt,
    DatePrompt,
    NumberPrompt,
    MultiselectPrompt,
    AutocompletePrompt,
    AutocompleteMultiselectPrompt,
    ConfirmPrompt
};
