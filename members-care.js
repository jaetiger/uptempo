// Firebase 설정
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 로그인 처리
document.getElementById('login-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('member-care').style.display = 'block';
        document.getElementById('user-name').textContent = user.displayName;

        // 사용자 목표 불러오기
        loadUserGoals(user.uid);
    });
});

// 사용자 목표 불러오기
function loadUserGoals(uid) {
    db.collection('goals').doc(uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('calories').value = data.calories || '';
            document.getElementById('protein').value = data.protein || '';
            document.getElementById('weight').value = data.weight || '';
        }
    });
}

// 목표 저장
document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const goals = {
        calories: document.getElementById('calories').value,
        protein: document.getElementById('protein').value,
        weight: document.getElementById('weight').value,
    };

    db.collection('goals').doc(user.uid).set(goals).then(() => {
        alert('Goals saved successfully!');
    });
});
