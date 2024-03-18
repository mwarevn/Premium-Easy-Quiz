// short this code
const fetchUrl = "https://6514b3f1dc3282a6a3cd7125.mockapi.io/server?name=Premium%20Easy%20Quiz";
fetch(fetchUrl)
	.then((res) => res.json())
	.then((res) => {
		if (res.length === 1 && res[0].alert) {
			const body = document.querySelector("body");
			body.appendChild(res[0].alert);
		}
	});
