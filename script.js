// --- INITIALIZATION ---
// Access Supabase using the global variable provided by the CDN
const { createClient } = supabase;

// These variables come from your config.js file
// Ensure SUPABASE_URL and SUPABASE_KEY are defined in config.js
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ROUTING / PAGE DETECTION (More robust than path checking) ---
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const scoreList = document.getElementById('score-list');
const quizContainer = document.getElementById('quiz-container');
const homeLoginLink = document.getElementById('login-link');

const isAuthPage = !!(loginBtn && signupBtn);
const isDashboard = !!scoreList;
const isQuiz = !!quizContainer;
const isHome = !!homeLoginLink;

console.log("Page detection:", { isAuthPage, isDashboard, isQuiz, isHome });

// --- 1. AUTHENTICATION (Login & Sign Up) ---
if (isAuthPage) {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const message = document.getElementById('auth-message');

    async function handleAuth(type) {
        console.log("Handling auth:", type);
        const email = emailInput.value;
        const password = passInput.value;

        if (!email || !password) {
            message.textContent = "Please enter both email and password.";
            return;
        }

        message.textContent = "Processing...";
        message.style.color = "yellow";

        let error, data;
        try {
            if (type === 'signup') {
                const result = await _supabase.auth.signUp({ email, password });
                error = result.error;
                if (!error) {
                    message.textContent = "Success! Check your email to confirm account.";
                    message.style.color = "#4caf50";
                }
            } else {
                const result = await _supabase.auth.signInWithPassword({ email, password });
                error = result.error;
                if (!error) {
                    // Redirect on success
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (err) {
            console.error("Unexpected auth error:", err);
            error = { message: "Unexpected error occurred." };
        }

        if (error) {
            console.error("Auth error:", error);
            message.textContent = "Error: " + error.message;
            message.style.color = "red";
        }
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    signupBtn.addEventListener('click', () => handleAuth('signup'));
}

// --- 2. LOGOUT (Available globally if button exists) ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await _supabase.auth.signOut();
        window.location.href = 'index.html';
    });
}

// --- 3. SESSION CHECKER (Protect Dashboard & Quiz) ---
async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    console.log("Session Status:", session ? "Logged In" : "Guest");

    // If we are on a protected page but not logged in...
    if (!session && (isDashboard || isQuiz)) {
        window.location.href = 'auth.html';
        return null;
    }

    // If we are on Home, adjust the navbar links
    if (isHome && session) {
        const dashLink = document.getElementById('dash-link');
        if (homeLoginLink) homeLoginLink.style.display = 'none';
        if (dashLink) dashLink.style.display = 'inline';
    }

    // If on Dashboard, show user info and load scores
    if (isDashboard && session) {
        document.getElementById('user-email').textContent = session.user.email;
        loadScores(session.user.id);
    }

    return session;
}

// Run the check
checkSession();

// --- 4. DASHBOARD LOGIC ---
// This function is called by the HTML onclick="startQuiz('Maths')"
window.startQuiz = function (category) {
    window.location.href = `quiz.html?category=${category}`;
}

async function loadScores(userId) {
    const list = document.getElementById('score-list');
    // Fetch last 5 scores from Supabase
    const { data, error } = await _supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('date_played', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        list.innerHTML = '<li>Error loading scores.</li>';
    } else if (!data || data.length === 0) {
        list.innerHTML = '<li>No quizzes played yet. Go play one!</li>';
    } else {
        list.innerHTML = data.map(s =>
            `<li style="padding: 5px; border-bottom: 1px solid #333;">
                <strong>${s.category}</strong>: ${s.score}% 
                <span style="font-size: 0.8em; color: #888;">(${new Date(s.date_played).toLocaleDateString()})</span>
            </li>`
        ).join('');
    }
}

// --- 5. QUIZ LOGIC ---
if (isQuiz) {
    // Get category from URL (e.g., quiz.html?category=Maths)
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (!category) {
        window.location.href = 'dashboard.html';
    }

    document.getElementById('quiz-category-title').textContent = category + " Quiz";

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // Load questions for this specific category
    async function fetchQuestions() {
        const { data, error } = await _supabase
            .from('questions')
            .select('*')
            .eq('category', category);

        if (error || !data || data.length === 0) {
            document.getElementById('question-text').textContent = "No questions found for this category.";
            document.getElementById('options-container').style.display = 'none';
        } else {
            questions = data;
            showQuestion();
        }
    }

    function showQuestion() {
        const q = questions[currentQuestionIndex];
        document.getElementById('question-text').textContent = q.question_text;

        // Reset buttons
        const btns = ['A', 'B', 'C', 'D'];
        btns.forEach(opt => {
            const btn = document.getElementById(`btn-${opt}`);
            // Map option_a, option_b... dynamically
            btn.textContent = q[`option_${opt.toLowerCase()}`];
            btn.style.backgroundColor = '#2c2c2c'; // Dark grey default
            btn.style.border = '1px solid #555';
            btn.disabled = false;
        });

        document.getElementById('feedback-text').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    }

    // Attach click events to the 4 buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedOption = e.target.id.split('-')[1]; // Extracts 'A', 'B', 'C' or 'D'
            const correctOption = questions[currentQuestionIndex].correct_answer;

            // Visual Feedback
            if (selectedOption === correctOption) {
                score++;
                e.target.style.backgroundColor = '#4caf50'; // Green
            } else {
                e.target.style.backgroundColor = '#f44336'; // Red
                // Highlight the correct one so they learn
                document.getElementById(`btn-${correctOption}`).style.backgroundColor = '#4caf50';
            }

            // Lock buttons
            document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

            // Wait 1.5 seconds then next question
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    showQuestion();
                } else {
                    finishQuiz();
                }
            }, 1500);
        });
    });

    async function finishQuiz() {
        const finalPercentage = Math.round((score / questions.length) * 100);

        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('final-score').textContent = finalPercentage + "%";

        // Save to Database
        const { data: { session } } = await _supabase.auth.getSession();
        if (session) {
            await _supabase.from('scores').insert({
                user_id: session.user.id,
                category: category,
                score: finalPercentage
            });
        }
    }

    fetchQuestions();
}
