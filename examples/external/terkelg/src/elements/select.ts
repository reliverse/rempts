// @ts-nocheck

import color from "kleur";
import Prompt from "./prompt.js";
import {
  style,
  clear,
  figures,
  wrap,
  entriesToDisplay,
} from "../util/index.js";
import { cursor } from "sisteransi";

/**
 * SelectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {Number} [opts.initial] Index of default value
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
 */
class SelectPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.hint = opts.hint || "- Use arrow-keys. Return to submit.";
    this.warn = opts.warn || "- This option is disabled";
    //#PATCH: find the first non-heading choice
    this.cursorStart = opts.choices.findIndex((c) => !c.heading);
    this.cursor = opts.cursor || this.cursorStart;
    this.choices = opts.choices.map((ch, idx) => {
      if (typeof ch === "string") ch = { title: ch, value: idx };
      return {
        title: ch && (ch.title || ch.value || ch),
        value: ch && (ch.value === undefined ? idx : ch.value),
        description: ch && ch.description,
        selected: ch && ch.selected,
        disabled: ch && ch.disabled,
        heading: ch && ch.heading,
      };
    });
    this.optionsPerPage = opts.optionsPerPage || 10;
    this.value = (this.choices[this.cursor] || {}).value;
    this.clear = clear("", this.out.columns);
    this.render();
  }
  moveCursor(n) {
    this.cursor = n;
    this.value = this.choices[n].value;
    this.fire();
  }
  reset() {
    this.moveCursor(this.cursorStart);
    this.fire();
    this.render();
  }
  exit() {
    this.abort();
  }
  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write("\n");
    this.close();
  }
  submit() {
    if (!this.selection.disabled) {
      this.done = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write("\n");
      this.close();
    } else this.bell();
  }
  first() {
    this.moveCursor(this.cursorStart);
    this.render();
  }
  last() {
    this.moveCursor(this.choices.length - 1);
    this.render();
  }
  up() {
    if (this.cursor === this.cursorStart) {
      this.moveCursor(this.choices.length - 1);
    } else {
      this.moveCursor(this.cursor - 1);
      if (this.choices[this.cursor].heading) {
        this.up();
      }
    }
    this.render();
  }
  down() {
    if (this.cursor === this.choices.length - 1) {
      this.moveCursor(this.cursorStart);
    } else {
      this.moveCursor(this.cursor + 1);
      if (this.choices[this.cursor].heading) {
        this.down();
      }
    }
    this.render();
  }
  next() {
    this.moveCursor((this.cursor + 1) % this.choices.length);
    if (this.choices[this.cursor].heading) {
      this.next();
    }
    this.render();
  }
  _(c, key) {
    if (c === " ") return this.submit();
  }
  get selection() {
    return this.choices[this.cursor];
  }
  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();
    let { startIndex, endIndex } = entriesToDisplay(
      this.cursor,
      this.choices.length,
      this.optionsPerPage,
    );
    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.done
        ? this.selection.title
        : this.selection.disabled
          ? color.yellow(this.warn)
          : color.gray(this.hint),
    ].join(" ");
    // Print choices
    if (!this.done) {
      this.outputText += "\n";
      for (let i = startIndex; i < endIndex; i++) {
        let title,
          prefix,
          desc = "",
          v = this.choices[i];
        // Determine whether to display "more choices" indicators
        if (i === startIndex && startIndex > 0) {
          // add '\b\b' to move the arrow to the left twice, fix the display of the heading choice
          prefix = "\b\b" + figures.arrowUp + "  ";
        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
          prefix = "\b\b" + figures.arrowDown + "  ";
        } else {
          prefix = " ";
        }
        if (v.disabled) {
          title =
            this.cursor === i
              ? color.gray().underline(v.title)
              : color.strikethrough().gray(v.title);
          prefix =
            (this.cursor === i
              ? color.bold().gray(figures.pointer) + " "
              : "  ") + prefix;
        } else if (v.heading) {
          title = v.title;
          // if prefix is arrow, remove the two spaces after it, fix the display of the heading choice
          prefix = prefix === " " ? prefix : prefix.slice(0, -2);
        } else {
          // Highlight the current option
          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
          prefix =
            (this.cursor === i ? color.cyan(figures.pointer) + " " : "  ") +
            prefix;
          // Add description if available
          if (v.description && this.cursor === i) {
            desc = ` - ${v.description}`;
            if (
              prefix.length + title.length + desc.length >= this.out.columns ||
              v.description.split(/\r?\n/).length > 1
            ) {
              desc =
                "\n" +
                wrap(v.description, { margin: 3, width: this.out.columns });
            }
          }
        }
        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
      }
    }
    this.out.write(this.outputText);
  }
}
export default SelectPrompt;
