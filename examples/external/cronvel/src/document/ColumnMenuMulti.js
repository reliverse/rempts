import Element from "./Element.js";
import ColumnMenu from "./ColumnMenu.js";
import ToggleButton from "./ToggleButton.js";
// @ts-nocheck
// Inherit from ColumnMenu for common methods
function ColumnMenuMulti(options) {
    // Clone options if necessary
    options = !options ? {} : options.internal ? options : Object.create(options);
    options.internal = true;
    // ColumnMenuMulti value is always a set of values
    if (options.value && typeof options.value === "object") {
        this.setValue(options.value, true);
    }
    else {
        this.value = {};
    }
    ColumnMenu.call(this, options);
    // Only draw if we are not a superclass of the object
    if (this.elementType === "ColumnMenuMulti" && !options.noDraw) {
        this.draw();
    }
}
Element.inherit(ColumnMenuMulti, ColumnMenu);
ColumnMenuMulti.prototype.ButtonClass = ToggleButton;
ColumnMenuMulti.prototype.childUseParentKeyValue = true;
ColumnMenuMulti.prototype.initChildren = function (noInitPage = false) {
    ColumnMenu.prototype.initChildren.call(this);
    // Only initPage if we are not a superclass of the object
    if (this.elementType === "ColumnMenuMulti" && !noInitPage) {
        this.initPage();
    }
};
// Set all existing children ToggleButton to the correct value
ColumnMenuMulti.prototype.setValue = function (value, noDraw) {
    if (!value || typeof value !== "object") {
        return;
    }
    this.value = {};
    if (Array.isArray(value) || value instanceof Set) {
        for (let key of value) {
            if (key && typeof key === "string") {
                this.value[key] = true;
            }
        }
    }
    else {
        for (let key in value) {
            this.value[key] = !!value[key];
        }
    }
    // Can be called during init, before .initPage() is called
    if (!this.buttons) {
        return;
    }
    this.buttons.forEach((button) => {
        if (button.internalRole ||
            !button.key ||
            !(button instanceof ToggleButton)) {
            return;
        }
        button.setValue(!!this.value[button.key], true, true);
    });
    if (!noDraw) {
        this.draw();
    }
};
ColumnMenuMulti.prototype.setKeyValue = function (key, value, noDraw) {
    if (!key) {
        return;
    }
    this.value[key] = !!value;
    // Can be called during init, before .initPage() is called
    if (!this.buttons) {
        return;
    }
    this.buttons.forEach((button) => {
        if (button.internalRole ||
            button.key !== key ||
            !(button instanceof ToggleButton)) {
            return;
        }
        button.setValue(!!value, true, true);
    });
    if (!noDraw) {
        this.draw();
    }
};
ColumnMenuMulti.prototype.onButtonSubmit = function (buttonValue, action, button) {
    switch (button.internalRole) {
        case "previousPage":
            this.previousPage();
            break;
        case "nextPage":
            this.nextPage();
            break;
        default:
            this.emit("submit", this.value, action, this, button);
    }
};
ColumnMenuMulti.prototype.onButtonToggle = function (buttonValue, action, button) {
    if (!button.key) {
        return;
    }
    if (buttonValue) {
        this.value[button.key] = true;
    }
    else {
        delete this.value[button.key];
    }
    this.emit("itemToggle", button.key, buttonValue, button);
};
const userActions = ColumnMenuMulti.prototype.userActions;
userActions.submit = function () {
    this.emit("submit", this.value, undefined, this);
};
export default ColumnMenuMulti;
