import Element from "./Element.js";
import Button from "./Button.js";
// @ts-nocheck
function ToggleButton(options) {
    // Clone options if necessary
    options = !options ? {} : options.internal ? options : Object.create(options);
    options.internal = true;
    // Almost everything is constructed by the normal 'submit-button'
    Button.call(this, options);
    this.value = !!options.value;
    this.key = options.key || null;
    if (this.elementType === "ToggleButton" && !options.noDraw) {
        this.draw();
    }
}
Element.inherit(ToggleButton, Button);
ToggleButton.prototype.keyBindings = {
    ENTER: "toggle",
    KP_ENTER: "toggle",
    ALT_ENTER: "submit",
};
// No blink effect
ToggleButton.prototype.blink = function () { };
ToggleButton.prototype.getValue = function () {
    return this.value;
};
ToggleButton.prototype.setValue = function (value, noDraw, noEmit) {
    value = !!value;
    if (this.value === value) {
        return;
    }
    this.value = value;
    this.updateStatus();
    if (!noEmit) {
        this.emit("toggle", this.value, undefined, this);
        this.emit(this.value ? "turnOn" : "turnOff", this.value, undefined, this);
    }
    if (!noDraw) {
        this.draw();
    }
};
ToggleButton.prototype.toggle = function (noDraw) {
    this.setValue(!this.value, noDraw);
};
ToggleButton.prototype.updateStatus = function () {
    if (this.disabled) {
        this.attr = this.disabledAttr;
        this.content = this.disabledContent;
        this.leftPadding = this.disabledLeftPadding;
        this.rightPadding = this.disabledRightPadding;
    }
    else if (this.hasFocus) {
        if (this.value) {
            this.attr = this.turnedOnFocusAttr;
            this.content = this.turnedOnFocusContent;
            this.leftPadding = this.turnedOnFocusLeftPadding;
            this.rightPadding = this.turnedOnFocusRightPadding;
        }
        else {
            this.attr = this.turnedOffFocusAttr;
            this.content = this.turnedOffFocusContent;
            this.leftPadding = this.turnedOffFocusLeftPadding;
            this.rightPadding = this.turnedOffFocusRightPadding;
        }
    }
    else if (this.value) {
        this.attr = this.turnedOnBlurAttr;
        this.content = this.turnedOnBlurContent;
        this.leftPadding = this.turnedOnBlurLeftPadding;
        this.rightPadding = this.turnedOnBlurRightPadding;
    }
    else {
        this.attr = this.turnedOffBlurAttr;
        this.content = this.turnedOffBlurContent;
        this.leftPadding = this.turnedOffBlurLeftPadding;
        this.rightPadding = this.turnedOffBlurRightPadding;
    }
};
ToggleButton.prototype.onHover = function (data) {
    if (this.disabled) {
        return;
    }
    this.document.giveFocusTo(this, "hover");
};
ToggleButton.prototype.onClick = function (data) {
    if (this.disabled) {
        return;
    }
    this.document.giveFocusTo(this, "select");
    this.toggle();
};
ToggleButton.prototype.onShortcut = function () {
    if (this.disabled) {
        return;
    }
    this.document.giveFocusTo(this, "select");
    this.toggle();
};
const userActions = ToggleButton.prototype.userActions;
userActions.toggle = function () {
    if (this.disabled) {
        return;
    }
    this.toggle();
};
userActions.submit = function (key) {
    if (this.disabled) {
        return;
    }
    this.emit("submit", this.key ? { [this.key]: this.value } : this.value, this.actionKeyBindings[key], this);
};
export default ToggleButton;
