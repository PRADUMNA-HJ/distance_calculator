import requests

test1 = requests.get('http://localhost:8000/api/v1/system/health')
print("Health status code:", test1.status_code)
print("Health body:", test1.text)

test2 = requests.post(
    'http://localhost:8000/api/v1/predict-distance', 
    json={"image_uri": "images/integration-sample.jpg", "mark_type": "box", "box": {"x": 12, "y": 18, "width": 32, "height": 20}},
    headers={"x-api-key": "dev-gateway-key", "Authorization": "Bearer demo-token"}
)
print("Predict status code:", test2.status_code)
print("Predict body:", test2.text)
