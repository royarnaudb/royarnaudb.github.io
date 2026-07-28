const input = document.getElementById(`phone`);

input && window.intlTelInput(input, {
	separateDialCode: true,
	initialCountry: 'bi',
	countrySearch: false,
	showFlags: true,
	countrySelectorMode: 'DROPDOWN',

	loadUtils: () => import("/static/js/utils.js"),

	customPlaceholder: (exampleNumber, selectedCountry) => exampleNumber ? exampleNumber.replace(/\d/g, "X") : "Enter number"
});

export class Dropdown {
	constructor(target, element=null) {
		if (!target)
			throw new Error("Dropdown target is required");

		if(element && element.getAttribute("data-component") === "dropdown") {
			this.element = element;
			this.target = this.element.querySelector(`#${target}`);
			
		} else {
			this.target = document.getElementById(target);
			this.element= !this.target ? null : this.target.closest('details[data-component="dropdown"]');
		}
		
		if (!this.element) {
			throw new Error("Dropdown element is required");
		}

		this.holder = this.element.querySelector('span[data-part="holder"]');
		
		if (!this.holder) {
			throw new Error("Dropdown holder is required");
		}
	}

	setValue(value, dataValue) {
		this.target.value = dataValue;

		/* Dispatch change event to trigger any listeners */
		const event = new Event("change", { bubbles: true });
		this.target.dispatchEvent(event);

		this.holder.textContent = value;
		this.element.removeAttribute("open");
	}
};