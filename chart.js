// 누적 기록을 불러와서 그래프로 표시하는 함수
function loadProgress(uid) {
    db.collection('progress').where('userId', '==', uid).orderBy('date', 'asc').get().then(snapshot => {
        const dates = [];
        const calories = [];
        const protein = [];
        const weight = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            dates.push(data.date);
            calories.push(data.calories);
            protein.push(data.protein);
            weight.push(data.weight);
        });

        // Chart.js로 그래프 표시
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Calories', data: calories, borderColor: 'red', fill: false },
                    { label: 'Protein (g)', data: protein, borderColor: 'blue', fill: false },
                    { label: 'Weight (kg)', data: weight, borderColor: 'green', fill: false }
                ]
            }
        });
    });
}
