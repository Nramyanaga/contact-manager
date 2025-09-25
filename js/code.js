//const urlBase = 'http://ramyanaga.xyz/LAMPAPI';
const urlBase =
  location.hostname === 'localhost'
    ? 'http://localhost/contact-manager/LAMPAPI'
    : '/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "login.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "login.html";
}

function addContact()
{
	let firstName = document.getElementById("contactFirstName").value;
	let lastName = document.getElementById("contactLastName").value;
	let phone = document.getElementById("contactPhone").value;
	let email = document.getElementById("contactEmail").value;

	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = {firstName:firstName, lastName:lastName, phone:phone, email:email, userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactAddResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    const resultEl = document.getElementById("contactAddResult");
                    resultEl.innerHTML = "Contact has been added";

                    // clear inputs
                    document.getElementById("contactFirstName").value = "";
                    document.getElementById("contactLastName").value = "";
                    document.getElementById("contactPhone").value = "";
                    document.getElementById("contactEmail").value = "";

                    // refresh list
                    searchContact();

                    // fade out message after 3 seconds
                    setTimeout(() => {
                        resultEl.innerHTML = "";
                    }, 3000);
                }
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

function searchContact()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactSearchResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    
                    for( let i=0; i<jsonObject.results.length; i++ )
                    {
                      contactList += `
                        <div class="contact-row">
                          <span>${jsonObject.results[i].FirstName} ${jsonObject.results[i].LastName}
                            ${jsonObject.results[i].Phone ? " Phone #: " + jsonObject.results[i].Phone : ""}
                            ${jsonObject.results[i].Email ? " Email: " + jsonObject.results[i].Email : ""}
                          </span>
                          <button class="delete-inline" onclick="deleteContact(${jsonObject.results[i].ID})">Delete</button>
                        </div>
                      `;

                    }
				}
				document.getElementById("contactList").innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
	
}

function deleteContact(contactIdFromSearch)
{
    // If called with parameter, use that. Otherwise fallback to input field.
    let contactId = contactIdFromSearch || document.getElementById("deleteContactId").value;
    
    document.getElementById("contactDeleteResult").innerHTML = "";

    let tmp = {id: contactId, userId: userId};
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactDeleteResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    const resultEl = document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";

                    // fade out message after 3 seconds
                    setTimeout(() => {
                        resultEl.innerHTML = "";
                    }, 3000);


                    // Refresh search results automatically
                    searchContact();
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("contactDeleteResult").innerHTML = err.message;
    }
}


function updateContact()
{
    let contactId = document.getElementById("updateContactId").value;
    let firstName = document.getElementById("updateFirstName").value;
    let lastName = document.getElementById("updateLastName").value;
    let phone = document.getElementById("updatePhone").value;
    let email = document.getElementById("updateEmail").value;
    
    document.getElementById("contactUpdateResult").innerHTML = "";

    let tmp = {id:contactId, firstName:firstName, lastName:lastName, phone:phone, email:email, userId:userId};
    let jsonPayload = JSON.stringify(tmp);
    
    let url = urlBase + '/UpdateContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactUpdateResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    document.getElementById("contactUpdateResult").innerHTML = "Contact has been updated successfully";
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("contactUpdateResult").innerHTML = err.message;
    }
}

function showInlineError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerText = msg || "";
}

function validateSignupFields({ firstName, lastName, login, password, password2 }) {
  if (!firstName || !lastName || !login || !password || !password2) {
    return "Please fill in all fields.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (password !== password2) {
    return "Passwords do not match.";
  }
  return "";
}

function doSignup() {
  // grab values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const login     = document.getElementById("signupLogin").value.trim();
  let   password  = document.getElementById("signupPassword").value;
  const password2 = document.getElementById("signupPassword2").value;

  // validations
  const err = validateSignupFields({ firstName, lastName, login, password, password2 });
  if (err) {
    showInlineError("signupResult", err);
    return;
  }

  // If your PHP expects MD5 (common in the starter), uncomment next line AND ensure login does same:
  // password = md5(password);

  const payload = { firstName, lastName, login, password };

  const url = urlBase + '/SignUp.' + extension; // hits SignUp.php on your server
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  showInlineError("signupResult", "Creating your account...");

  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      // success
      if (this.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText || "{}");
          if (res.error) {
            showInlineError("signupResult", res.error);
            return;
          }
          // If your SignUp.php returns the same fields as Login (id, firstName, lastName), you could
          // auto-login here; but the common flow is: redirect to login page with a success toast.
          showInlineError("signupResult", "");
          window.location.href = "index.html";
        } catch (e) {
          showInlineError("signupResult", "Unexpected response. Please try again.");
        }
      } else {
        showInlineError("signupResult", "Signup failed. Please try again.");
      }
    }
  };

  xhr.onerror = function () {
    showInlineError("signupResult", "Network error. Please try again.");
  };

  xhr.send(JSON.stringify(payload));
}

