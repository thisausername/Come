import { handleLogin, handleRegister } from './auth.js';

document.querySelectorAll('.tabs__button').forEach(btn => {
	btn.addEventListener('click', () => {
 	   	document.querySelectorAll('.tabs__button').forEach(b => b.classList.remove('active'));
    	btn.classList.add('active');
    
    	const formType = btn.dataset.formType;
    
    	document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
    	document.querySelector(`#${formType}-form`).classList.add('active');
  	});
});

document.getElementById('login').addEventListener('submit', handleLogin);
document.getElementById('register').addEventListener('submit', handleRegister);