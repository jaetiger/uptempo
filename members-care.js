// Firebase SDK 임포트
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { Chart } from "chart.js/auto"; // Chart.js 임포트

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA720paBCj0pn7cPrCtxCdO3S0g53aIk9w",
  authDomain: "uptempo-aa8e4.firebaseapp.com",
  projectId: "uptempo-aa8e4",
  storageBucket: "uptempo-aa8e4.appspot.com",
  messagingSenderId: "1051037240742",
  appId: "1:1051037240742:web:5b41d6a8c524ff96229367",
  measurementId: "G-CHGCN9JJX2"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google 로그인 처리
const provider = new GoogleAuthProvider();
document.getElementById('login-btn').addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('member-care').style.display = 'block';
      document.getElementById('user-name').textContent = user.displayName;

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
  const userDoc = doc(db, "goals", uid);
  getDoc(userDoc)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('calories').value = data.calories || '';
        document.getElementById('protein').value = data.protein || '';
        document.getElementById('weight').value = data.weight || '';
        console.log("목표 불러오기 성공:", data);
      } else {
        console.log("사용자 목표가 설정되지 않았습니다.");
      }
    })
    .catch((error) => {
      console.error("목표 불러오기 실패:", error);
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

  setDoc(doc(db, "goals", user.uid), goals)
    .then(() => {
      alert('목표가 성공적으로 저장되었습니다!');
    })
    .catch((error) => {
      console.error("목표 저장 실패:", error);
    });
});

// Firestore에서 사용자 기록 불러오기 및 차트 그리기
function loadProgress(uid) {
  const progressCollection = collection(db, "progress");
  const q = query(progressCollection, where("userId", "==", uid));

  getDocs(q)
    .then((snapshot) => {
      const dates = [];
      const calories = [];
      const protein = [];
      const weight = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        dates.push(data.date); // 날짜 저장
        calories.push(data.calories); // 칼로리 저장
        protein.push(data.protein); // 단백질 저장
        weight.push(data.weight); // 체중 저장
      });

      // Chart.js로 그래프 그리기
      drawChart(dates, calories, protein, weight);
    })
    .catch((error) => {
      console.error("기록 불러오기 실패:", error);
    });
}

// Chart.js로 차트를 그리는 함수
function drawChart(dates, calories, protein, weight) {
  const ctx = document.getElementById('progress-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Calories',
          data: calories,
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Protein (g)',
          data: protein,
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Weight (kg)',
          data: weight,
          borderColor: 'green',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
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
      }
    }
  });
}

// 로그아웃 처리 (옵션)
document.getElementById('logout-btn')?.addEventListener('click', () => {
  auth.signOut().then(() => {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('member-care').style.display = 'none';
    console.log("로그아웃 성공");
  }).catch((error) => {
    console.error("로그아웃 실패:", error);
  });
});
