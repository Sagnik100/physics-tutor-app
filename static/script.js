// Function to calculate force
document.getElementById('forceForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const mass = parseFloat(document.getElementById('mass').value);
    const acceleration = parseFloat(document.getElementById('acceleration').value);

    try {
        const response = await fetch('/calculate-force', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mass, acceleration })
        });

        const data = await response.json();

        if (data.error) {
            displayError(data.error);
        } else {
            displayResult(`Force: ${data.result}`, ["Force is measured in Newtons (N).", "F = m × a"]);
            drawChart("Force vs. Acceleration", "Acceleration (m/s²)", "Force (N)", [acceleration], [data.result]);
        }
    } catch (err) {
        displayError("An error occurred while calculating force.");
    }
});

// Function to calculate energy
document.getElementById('energyForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const mass = parseFloat(document.getElementById('energyMass').value);
    const velocity = parseFloat(document.getElementById('velocity').value) || 0;
    const height = parseFloat(document.getElementById('height').value) || 0;

    try {
        const response = await fetch('/calculate-energy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mass, velocity, height })
        });

        const data = await response.json();

        if (data.error) {
            displayError(data.error);
        } else {
            let resultMessage = "";
            if (data.kineticEnergy) {
                resultMessage += `Kinetic Energy: ${data.kineticEnergy}\n`;
            }
            if (data.potentialEnergy) {
                resultMessage += `Potential Energy: ${data.potentialEnergy}\n`;
            }

            displayResult(resultMessage, ["Energy is measured in Joules (J).", "K.E. = 0.5 × m × v²", "P.E. = m × g × h"]);

            if (velocity) {
                drawChart(
                    "Kinetic Energy vs. Velocity",
                    "Velocity (m/s)",
                    "Kinetic Energy (J)",
                    [velocity],
                    [parseFloat(data.kineticEnergy)]
                );
            }
        }
    } catch (err) {
        displayError("An error occurred while calculating energy.");
    }
});

// Function to display history
document.getElementById('viewHistory').addEventListener('click', async () => {
    try {
        const response = await fetch('/history');
        const history = await response.json();

        if (history.length === 0) {
            displayResult("No history found.");
        } else {
            const result = history.map(item => {
                return `Type: ${item[1]}, Input: ${item[2]}, Result: ${item[3]}`;
            }).join("<br>");

            displayResult(result);
        }
    } catch (err) {
        displayError("An error occurred while fetching history.");
    }
});

// Function to display ontology structure
document.getElementById('viewOntology').addEventListener('click', async () => {
    try {
        const response = await fetch('/ontology');
        const ontology = await response.json();

        const result = Object.entries(ontology)
            .map(([subject, objects]) => `<b>${subject}</b>: ${objects.join(", ")}`)
            .join("<br>");

        displayResult(result, ["This shows the ontology structure in a subject-predicate-object format."]);
    } catch (err) {
        displayError("An error occurred while fetching ontology.");
    }
});

// Utility function to display results
function displayResult(message, relatedConcepts = []) {
    const resultOutput = document.getElementById('resultOutput');
    resultOutput.innerHTML = message;

    const relatedConceptsList = document.getElementById('relatedConcepts');
    relatedConceptsList.innerHTML = "";

    relatedConcepts.forEach(concept => {
        const listItem = document.createElement('li');
        listItem.textContent = concept;
        relatedConceptsList.appendChild(listItem);
    });

    document.getElementById('results').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
}

// Utility function to display errors
function displayError(errorMessage) {
    const errorOutput = document.getElementById('errorMessage');
    errorOutput.textContent = errorMessage;

    document.getElementById('error').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
}

// Utility function to draw charts using Chart.js
function drawChart(title, xLabel, yLabel, xData, yData) {
    const chartCanvas = document.getElementById('chart');
    chartCanvas.classList.remove('hidden');

    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    window.chartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: xData,
            datasets: [{
                label: yLabel,
                data: yData,
                borderColor: 'blue',
                backgroundColor: 'lightblue',
                fill: false,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel,
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yLabel,
                    }
                }
            }
        }
    });
}
