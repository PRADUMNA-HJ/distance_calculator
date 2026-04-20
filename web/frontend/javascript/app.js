const predictBtn = document.getElementById('predictBtn');
const resultText = document.getElementById('resultText');

predictBtn.addEventListener('click', async () => {
  resultText.textContent = 'Calling API...';

  // Replace this payload with real annotation data from canvas interactions.
  const payload = {
    image_uri: 'images/demo.jpg',
    mark_type: 'box',
    box: { x: 25, y: 40, width: 140, height: 160 }
  };

  try {
    const response = await fetch('http://localhost:8000/api/v1/predict-distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-token'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      resultText.textContent = `Request failed with status ${response.status}`;
      return;
    }

    const data = await response.json();
    resultText.textContent = `Distance: ${data.distance_cm} cm (confidence: ${data.confidence})`;
  } catch (error) {
    resultText.textContent = 'API call failed. Check gateway/service status.';
  }
});
