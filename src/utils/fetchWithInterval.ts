export default async function fetchWithInterval(call: any) {
    let count = 0;

    return await new Promise((resolve, reject) => {

        call()
            .then(async (response: any) => {

                try {
                    const data = await response.json();
                    resolve(data);

                } catch (err) {
                    //no need to be parsed, just return server response
                    resolve(response);

                }
            })
            .catch((err: any) => {

                const interval = setInterval(() => {
                    if (count < 5) {
                        call()
                            .then(async (response: any) => {
                                try {
                                    const data = await response.json();
                                    resolve(data);

                                } catch (err) {
                                    //no need to be parsed, just return server response
                                    resolve(response);

                                } finally {
                                    clearInterval(interval);
                                }
                            })
                            .catch((err: any) => {
                                count++;
                                console.log(`Catch fetchWithInterval, take number ${count}`, err);
                            });

                    } else {
                        clearInterval(interval);
                        reject("fetch failed 5 times");
                    }

                }, 1000);

            });

    });
} 
