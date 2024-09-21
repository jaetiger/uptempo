// 차트 전역 변수 선언
let chart; // 이전에 생성된 차트를 추적하기 위해 선언

// 누적 기록을 불러와서 그래프로 표시하는 함수
function loadProgress(uid) {
    db.collection('progress').where('userId', '==', uid).orderBy('date', 'asc').get().then(snapshot => {
        const dates = [];
        const calories = [];
        const protein = [];
        const weight = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            // 날짜를 JavaScript Date 객체로 변환하고 포맷
            const date = new Date(data.date.seconds * 1000); // Firestore 타임스탬프 처리
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
            dates.push(formattedDate);
            calories.push(data.calories);
            protein.push(data.protein);
            weight.push(data.weight);
        });

        // 이미 차트가 있으면 제거하고 새로 그리기
        if (chart) {
            chart.destroy(); // 기존 차트를 제거
        }

        // Chart.js로 그래프 표시
        const ctx = document.getElementById('progress-chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Calories', data: calories, borderColor: 'red', fill: false },
                    { label: 'Protein (g)', data: protein, borderColor: 'blue', fill: false },
                    { label: 'Weight (kg)', data: weight, borderColor: 'green', fill: false }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Values'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    });
}

