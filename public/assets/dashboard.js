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
            displayData: (rawData) => {
                let data = [];
                Array.from(Object.entries(rawData)).forEach(v => {
                    console.log(v[1].pH.pHValue);
                    data.push({
                        pH: v[1].pH.pHValue,
                        time: JSON.parse(v[1].timestamp)
                    });
                });

                new Morris.Line({
                    element: 'pHValue',
                    data: data,
                    xkey: 'time',
                    ykeys: ['pH'],
                    labels: ['pH Value'],
                    dateFormat: (x) => utilities.getTime(new Date(x)),
                    resize: true,
                  });
            }
        },
        utilities = {
            getTime: (date) => {
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
