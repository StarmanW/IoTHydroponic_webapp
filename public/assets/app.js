(() => {
    let GLOBAL_DATA = null;
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
        getData: async (timestamp, callback) => {
            let snapshot = null;
            if (timestamp === null) {
                let date = new Date();
                date.setHours(0, 0, 0, 0);
                snapshot = await firebase.database().ref('/IoTHydroponic-1').orderByChild('timestamp').startAt(date.getTime());
            } else if (timestamp === 0) {
                snapshot = await firebase.database().ref('/IoTHydroponic-1').orderByChild('timestamp').limitToLast(50);
            } else {
                snapshot = await firebase.database().ref('/IoTHydroponic-1').orderByChild('timestamp').startAt(timestamp);
            }

            snapshot.on('value', (data) => {
                if (data.val() === null) {
                    firebaseDB.getData(0, UI.displayData);
                } else {
                    GLOBAL_DATA = data;
                    callback(data.val());
                }
            })
        }
    },
        UI = {
            displayData: (rawData) => {
                rawData = Array.from(Object.entries(rawData));
                UI.resetUI();
                UI.alertCheck(rawData);
                UI.displayTableData(rawData);
                morris.pHLineGraph(rawData);
                morris.statistics(rawData);
            },
            updateInterval: (rawData) => {
                UI.resetUI();
                UI.displayTableData(rawData);
                morris.pHLineGraph(rawData);
                morris.statistics(rawData);
            },
            resetUI: () => {
                document.querySelector('#pHValue').innerHTML = "";
                document.querySelector('#pHSolution').innerHTML = "";
                document.querySelector('#foodAmount').innerHTML = "";
                document.querySelector('#pHValueLine').innerHTML = "";
                document.querySelector('.acidTbody').innerHTML = "";
                document.querySelector('.alkalineTbody').innerHTML = "";
                document.querySelector('.fishFoodTbody').innerHTML = "";
            },
            displayTableData: (rawData) => {
                const acidTbody = document.querySelector('.acidTbody'),
                    alkalineTbody = document.querySelector('.alkalineTbody'),
                    fishFoodTbody = document.querySelector('.fishFoodTbody'),
                    acidTable = [],
                    alkalineTable = [],
                    fishFoodTable = [];

                rawData.forEach(e => {
                    if (e[1].pH.acidStatus === 'Active') {
                        acidTable.push(e[1]);
                    }
                    if (e[1].pH.alkaliStatus === 'Active') {
                        alkalineTable.push(e[1]);
                    }
                    if (e[1].feeder.status === 'Active') {
                        fishFoodTable.push(e[1]);
                    }
                });

                acidTable.forEach(e => {
                    acidTbody.innerHTML += `
                        <tr>
                            <td>${e.pH.pHValue}</td>
                            <td>${e.pH.acidAmount} ml</td>
                            <td>${utilities.getTime(new Date(e.timestamp))}</td>
                        </tr>
                    `;
                });

                alkalineTable.forEach(e => {
                    alkalineTbody.innerHTML += `
                        <tr>
                            <td>${e.pH.pHValue}</td>
                            <td>${e.pH.alkaliAmount} ml</td>
                            <td>${utilities.getTime(new Date(e.timestamp))}</td>
                        </tr>
                    `;
                });

                fishFoodTable.forEach(e => {
                    fishFoodTbody.innerHTML += `
                        <tr>
                            <td>${e.feeder.amount}</td>
                            <td>${utilities.getTime(new Date(e.timestamp))}</td>
                        </tr>
                    `;
                });
            },
            alertCheck: (rawData) => {
                const alertWarning = document.querySelector('.alert-warning'),
                    alertDanger = document.querySelector('.alert-danger'),
                    foodAmount = rawData[rawData.length - 1][1].feeder.amount,
                    acidAmount = rawData[rawData.length - 1][1].pH.acidAmount,
                    alkaliAmount = rawData[rawData.length - 1][1].pH.alkaliAmount;
                let warning = false,
                    danger = false,
                    warnOutput = '',
                    dangerOutput = '';

                alertDanger.style.display = 'none';
                alertWarning.style.display = 'none';

                if (foodAmount <= 0) {
                    danger = true;
                    dangerOutput += 'Fish food is currently empty, please refill the food.<br/>';
                } else if (foodAmount < 100) {
                    warning = true;
                    warnOutput += 'Be alert! Fish food is running low, please refill the food.<br/>';
                }

                if (acidAmount <= 0) {
                    danger = true;
                    dangerOutput += 'Acid solution is currently empty, please refill the solution.<br/>';
                } else if (acidAmount < 100) {
                    warning = true;
                    warnOutput += 'Be alert! Acid solution is running low, please refill the solution.<br/>';

                }

                if (alkaliAmount <= 0) {
                    danger = true;
                    dangerOutput += 'Alkali solution is currently empty, please refill the solution.<br/>';
                } else if (alkaliAmount < 100) {
                    warning = true;
                    warnOutput += 'Be alert! Alkali solution is running low, please refill the solution.<br/>';
                }

                if (danger) {
                    alertDanger.querySelector('.alert_text').innerHTML = dangerOutput;
                    alertDanger.style.display = '';
                }
                if (warning) {
                    alertWarning.querySelector('.alert_text').innerHTML = warnOutput;
                    alertWarning.style.display = '';
                }
            },
            initIntervalUI: () => {
                const timeSelect = document.querySelector('#timeSelect');
                timeSelect.addEventListener('change', (e) => {
                    let data = Array.from(Object.entries(GLOBAL_DATA.val())),
                    filteredData = [],
                    timeBoundary = data[data.length - 1][1].timestamp - timeSelect.value * 60000;
                    
                    if (timeSelect.value === '0') {
                        UI.updateInterval(data);
                        return;
                    }
                    filteredData = data.filter((d) => {
                        return d[1].timestamp >= timeBoundary;
                    });
                    UI.updateInterval(filteredData);
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
        }, morris = {
            statistics: (rawData) => {
                new Morris.Donut({
                    element: 'pHValue',
                    data: [
                        {
                            label: "None",
                            value: 14.0 - rawData[rawData.length - 1][1].pH.pHValue
                        },
                        {
                            label: 'pH Value',
                            value: rawData[rawData.length - 1][1].pH.pHValue
                        }
                    ],
                    colors: ['#00c250', '#008f3b'],
                    resize: true,
                });

                new Morris.Donut({
                    element: 'pHSolution',
                    data: [
                        {
                            label: 'Acid Solution',
                            value: rawData[rawData.length - 1][1].pH.acidAmount
                        },
                        {
                            label: "Alkali Solution",
                            value: rawData[rawData.length - 1][1].pH.alkaliAmount
                        }
                    ],
                    formatter: (y, data) => `${y} ml`,
                    colors: ['#d50000', '#0d47a1'],
                    resize: true,
                });

                new Morris.Donut({
                    element: 'foodAmount',
                    data: [
                        {
                            label: 'Food Amount',
                            value: rawData[rawData.length - 1][1].feeder.amount
                        },
                        {
                            label: '',
                            value: rawData[0][1].feeder.amount - rawData[rawData.length - 1][1].feeder.amount
                        }
                    ],
                    formatter: (y, data) => `${y} ml`,
                    colors: ['#db4d00', '#ff6817'],
                    resize: true,
                });
            },
            pHLineGraph: (rawData) => {
                let data = [];
                rawData.forEach(v => {
                    data.push({
                        pH: v[1].pH.pHValue,
                        time: JSON.parse(v[1].timestamp)
                    });
                });

                new Morris.Area({
                    element: 'pHValueLine',
                    data: data,
                    xkey: 'time',
                    ykeys: ['pH'],
                    ymax: 14,
                    ymin: 0,
                    labels: ['pH Value'],
                    dateFormat: (x) => utilities.getTime(new Date(x)),
                    resize: true,
                    behaveLikeLine: true
                });
            }
        }

    // Run
    firebaseDB.initFirebase();
    firebaseDB.getData(null, UI.displayData);
    UI.initIntervalUI();
})();
