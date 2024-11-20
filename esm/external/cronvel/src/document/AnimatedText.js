import Element from "./Element.js";
import Text from "./Text.js";
import spChars from "../spChars.js";
// @ts-nocheck
function AnimatedText(options) {
    // Clone options if necessary
    options = !options ? {} : options.internal ? options : Object.create(options);
    options.internal = true;
    options.attr = options.attr || {};
    if (Array.isArray(options.animation)) {
        this.animation = options.animation;
    }
    else if (typeof options.animation === "string") {
        this.animation =
            spChars.animation[options.animation] || spChars.animation.lineSpinner;
        if (options.contentHasMarkup !== false) {
            options.contentHasMarkup = true;
        }
    }
    else {
        this.animation = spChars.animation.lineSpinner;
    }
    this.animation = this.animation.map((e) => (Array.isArray(e) ? e : [e]));
    this.isAnimated = false;
    this.frameDuration = options.frameDuration || 150;
    this.animationSpeed = options.animationSpeed || 1;
    this.frame = options.frame || 0;
    this.autoUpdateTimer = null;
    this.autoUpdate = this.autoUpdate.bind(this);
    options.content = this.animation[this.frame];
    Text.call(this, options);
    if (this.elementType === "AnimatedText" && !options.noDraw) {
        this.draw();
        this.animate();
    }
}
Element.inherit(AnimatedText, Text);
AnimatedText.prototype.inlineCursorRestoreAfterDraw = true;
AnimatedText.prototype.animate = function (animationSpeed = 1) {
    this.isAnimated = !!animationSpeed;
    this.animationSpeed = +animationSpeed || 0;
    if (!this.isAnimated) {
        if (this.autoUpdateTimer) {
            clearTimeout(this.autoUpdateTimer);
        }
        this.autoUpdateTimer = null;
        return;
    }
    if (!this.autoUpdateTimer) {
        this.autoUpdateTimer = setTimeout(() => this.autoUpdate(), this.frameDuration / this.animationSpeed);
    }
};
AnimatedText.prototype.autoUpdate = function () {
    this.frame = (this.frame + 1) % this.animation.length;
    this.content = this.animation[this.frame];
    this.draw();
    this.autoUpdateTimer = setTimeout(() => this.autoUpdate(), this.frameDuration / this.animationSpeed);
};
export default AnimatedText;
