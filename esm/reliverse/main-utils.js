import { colorMap } from "~/utils/mapping.js";
import { msg } from "~/utils/messages.js";
export function createColorChoices() {
    return Object.keys(colorMap).map((key) => ({
        title: colorMap[key](key.charAt(0).toUpperCase() + key.slice(1)),
        id: key,
    }));
}
export function calculateAge(birthday) {
    // Parse the user's birthday and calculate their age
    const today = new Date();
    const [day, month, year] = birthday.split(".").map(Number);
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear = today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());
    if (!hasHadBirthdayThisYear) {
        age--;
    }
    return age;
}
export function validateAge(calculatedAge, userAge, birthday) {
    const ageMessage = "Based on your birthday date (" +
        birthday +
        "), you're " +
        calculatedAge +
        " years old.";
    if (calculatedAge === userAge) {
        msg({
            type: "M_INFO",
            title: "Your age and birthday correspond! " + ageMessage,
            titleColor: "green",
        });
    }
    else {
        msg({
            type: "M_ERROR",
            title: "Your age and birthday don't correspond! " + ageMessage,
            titleColor: "red",
        });
    }
}
export function hashPassword(password) {
    return password.split("").reverse().join("");
}
export function displayUserInputs(userInput) {
    const color = userInput.color;
    if (color === "red" || color === "redBright") {
        userInput.color = "redBright";
        msg({
            type: "M_INFO",
            title: "User's favorite color is red. Johnny Silverhand approves.",
            titleColor: userInput.color,
        });
    }
    else {
        msg({
            type: "M_INFO",
            title: `User's favorite color is: ${color}`,
            titleColor: color,
        });
    }
}
