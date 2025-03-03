
export const handleLogin = async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

	try {
 		const response = await fetch('/api/login', {
  			method: 'POST',
   		 	headers: { 'Content-Type': 'application/json' },
    		body: JSON.stringify(data)
    	});
    
    	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    	alert('login success');
  	} catch (error) {
    	alert(`login failed: ${error.message}`);
  	}
};

export const handleRegister = async (event) => {
	event.preventDefault();
  
	const formData = new FormData(event.target);
  	const data = {
   		email: formData.get('email'),
    	password: formData.get('password')
  	};

  	try {
   		const response = await fetch('/api/register', {
      		method: 'POST',
      		headers: { 'Content-Type': 'application/json' },
      		body: JSON.stringify(data)
    	});
    
    	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    	alert('register success');
  	} catch (error) {
   		alert(`register failed: ${error.message}`);
  	}
};


