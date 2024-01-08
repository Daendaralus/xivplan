export async function createPaste(text: string): Promise<string> {
    const response = await fetch('https://corsproxy.io/?https://paste.myst.rs/api/v2/paste', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            expires: "never",  // Optional: set an expiration time
            pasties: [
                {
                    language: "plain text",
                    title: "XIVplan",  // Optional: set a title for this snippet
                    code: text,
                }
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data._id;
}

export async function retrievePaste(id: string): Promise<string> {
    const response = await fetch(`https://paste.myst.rs/api/v2/paste/${id}`);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Assuming the paste contains a single snippet
    return data.pasties[0].code;
}
