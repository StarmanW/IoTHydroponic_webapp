(() => {
    const firebaseDB = {
        getConfig: () => {
            return {
                apiKey: "AIzaSyA2fyucWNeCiigmO-ckFRUv50eT0NVR5Ac",
                authDomain: "iothydroponic-79927.firebaseapp.com",
                databaseURL: "https://iothydroponic-79927.firebaseio.com",
                projectId: "iothydroponic-79927",
                storageBucket: "iothydroponic-79927.appspot.com",
                messagingSenderId: "20267787150",
                appId: "1:20267787150:web:fd44811535f20018"
            };
        },
        initFirebase: () => {
            return firebase.initializeApp(firebaseDB.getConfig());
        },
        getData: async (displayData) => {
            let snapshot = await firebase.database().ref('/IoTHydroponic-1').once('value');
            let data = await snapshot.val();
            displayData(data);
        }
    },
        UI = {
            displayData: (data) => {
                Array.from(Object.entries(data)).forEach(v => {
                    const d = new Date(Date.parse(JSON.parse(v[1].timestamp))),
                        output = `<tr>
                        <td>${v[1].pH.pHValue}</td>
                        <td>${v[1].pH.acidAmount}</td>
                        <td>${v[1].pH.alkaliAmount}</td>
                        <td>${v[1].pH.acidStatus}</td>
                        <td>${v[1].pH.alkaliStatus}</td>
                        <td>${v[1].feeder.amount}</td>
                        <td>${v[1].feeder.status}</td>
                        <td>${Date.parse(JSON.parse(v[1].timestamp))}</td >
                    </tr > `;
                    document.querySelector('.tbody_content').innerHTML += output;
                });
            }
        },
        utilities = {
            getTime: (time) => {
                const date = new Date(Date.parse(JSON.parse(time)));
                let output = "";
                (date.getHours() > 12) ? output += `${utilities.pad(date.getHours(), 2)}:` : utilities.pad(date.getHours(), 2);
                output += `${utilities.pad(date.getMinutes(), 2)}:`;
                output += `${utilities.pad(date.getSeconds(), 2)} `;
                (date.getHours() > 12) ? output += 'PM' : 'AM';
                return output
            },
            pad: (str, max) => {
                str = str.toString();
                return str.length < max ? utilities.pad("0" + str, max) : str;
            }
        };

    // Run
    firebaseDB.initFirebase();
    firebaseDB.getData(UI.displayData);
})();
