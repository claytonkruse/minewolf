export function beforeSubmit(submitButton: HTMLButtonElement) {
	const originalText = submitButton.innerText;
	submitButton.innerText = '';
	submitButton.ariaBusy = 'true';
	return ({ update }: { update: Function }) => {
		submitButton.innerText = originalText;
		submitButton.ariaBusy = null;
		update({ reset: false });
	};
}
