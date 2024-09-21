// Firebase 설정
var firebaseConfig = {
  apiKey: "AIzaSyA720paBCj0pn7cPrCtxCdO3S0g53aIk9w", // 실제 Firebase API 키
  authDomain: "uptempo-aa8e4.firebaseapp.com",
  projectId: "uptempo-aa8e4",
  storageBucket: "uptempo-aa8e4.appspot.com",
  messagingSenderId: "1051037240742",
  appId: "1:1051037240742:web:5b41d6a8c524ff96229367", // 실제 Firebase App ID
  measurementId: "G-CHGCN9JJX2"
};


// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 로그인 상태 감지
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('logout-btn').style.display = 'block'; // 로그아웃 버튼 표시
    document.getElementById('member-care').style.display = 'block'; // Member's care 섹션 표시
    document.getElementById('login-message').style.display = 'none'; // 로그인 안내 메시지 숨기기
  } else {
    document.getElementById('logout-btn').style.display = 'none'; // 로그아웃 버튼 숨기기
    document.getElementById('member-care').style.display = 'none'; // Member's care 섹션 숨기기
    document.getElementById('login-message').style.display = 'block'; // 로그인 안내 메시지 표시
  }
});

// 로그인 팝업 열기
document.getElementById('open-login-popup').addEventListener('click', function () {
  document.getElementById('login-popup').style.display = 'block';
});

// 로그인 팝업 닫기
document.querySelector('.close').addEventListener('click', function () {
  document.getElementById('login-popup').style.display = 'none';
});

// Google 로그인 처리
const provider = new firebase.auth.GoogleAuthProvider();
document.getElementById('login-btn').addEventListener('click', function () {
  auth.signInWithPopup(provider)
    .then((result) => {
      document.getElementById('login-popup').style.display = 'none'; // 팝업 닫기
      const user = result.user;
      document.getElementById('user-name').textContent = user.displayName;
      document.getElementById('member-care').style.display = 'block'; // 로그인 후 섹션 표시

      // 로그인 버튼 숨기기
      document.getElementById('open-login-popup').style.display = 'none';

      // 사용자 목표 불러오기
      loadUserGoals(user.uid);

      // 사용자 누적 기록 불러와 차트 그리기
      loadProgress(user.uid);
    })
    .catch((error) => {
      console.error("로그인 실패:", error);
    });
});

// 사용자 목표 불러오기 함수
function loadUserGoals(uid) {
  const userDoc = db.collection("goals").doc(uid);
  userDoc.get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('calories').value = data.calories || '';
      document.getElementById('protein').value = data.protein || '';
      document.getElementById('weight').value = data.weight || '';
    } else {
      console.log("사용자 목표가 설정되지 않았습니다.");
    }
  });
}

// 사용자 목표 저장
document.getElementById('goal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  const goals = {
    calories: document.getElementById('calories').value,
    protein: document.getElementById('protein').value,
    weight: document.getElementById('weight').value,
  };

  db.collection("goals").doc(user.uid).set(goals)
    .then(() => {
      alert('목표가 성공적으로 저장되었습니다!');
    })
    .catch((error) => {
      console.error("목표 저장 실패:", error);
    });
});

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

// 로그아웃 처리 (옵션)
document.getElementById('logout-btn')?.addEventListener('click', () => {
  auth.signOut().then(() => {
    document.getElementById('member-care').style.display = 'none';
    document.getElementById('open-login-popup').style.display = 'block'; // 로그인 버튼 다시 표시
    console.log("로그아웃 성공");
  }).catch((error) => {
    console.error("로그아웃 실패:", error);
  });
});
