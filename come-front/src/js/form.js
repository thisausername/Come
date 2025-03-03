
export function initFormTabs() {
    document.querySelectorAll('.tabs button').forEach(button =>{
        button.addEventListener('click', (e) => {
            const type = e.target.textContent.toLowerCase();
            showForm(type);
        })
    })
}

export function showForm(formType) {
    if (formType === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }
}

