fetch("http://localhost:3000/players/11b695a0-0043-4e4f-bca2-8db859cbf258")
    .then(async res => {
        const text = await res.text();
        console.log("STATUS:", res.status);
        if (text.includes("Error: ")) {
            const matches = text.match(/Error: [^<]+/g);
            console.log("ERRORS FOUND IN HTML:", matches);
        } else {
            console.log("Response starts with:", text.substring(0, 500));
        }
    })
    .catch(console.error);
